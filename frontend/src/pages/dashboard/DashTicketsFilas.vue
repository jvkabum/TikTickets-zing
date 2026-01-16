<template>
  <div v-if="userProfile === 'admin'">
    <div class="row col q-pa-md justify-between items-center">
      <h1>Painel Atendimentos</h1>
      <q-btn
        color="primary"
        icon="mdi-filter"
        label="Filtros"
        @click="visualizarFiltros = true"
      />
      <q-separator />
    </div>

    <q-dialog
      full-height
      position="right"
      v-model="visualizarFiltros"
    >
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Filtros</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <DatePick
            dense
            class="row col"
            v-model="pesquisaTickets.dateStart"
          />
          <DatePick
            dense
            class="row col"
            v-model="pesquisaTickets.dateEnd"
          />
          <q-separator v-if="profile === 'admin'" />
          <q-toggle
            v-if="profile === 'admin'"
            class="q-ml-lg"
            v-model="pesquisaTickets.showAll"
            label="(Admin) - Visualizar Todos"
          />
          <q-separator
            class="q-mb-md"
            v-if="profile === 'admin'"
          />

          <q-select
            v-if="!pesquisaTickets.showAll"
            square
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            multiple
            options-dense
            use-chips
            label="Filas"
            color="primary"
            v-model="pesquisaTickets.queuesIds"
            :options="filas"
            :input-debounce="700"
            option-value="id"
            option-label="queue"
            input-style="width: 280px; max-width: 280px;"
          />
          <!-- @input="debounce(BuscarTicketFiltro(), 700)" -->
        </q-card-section>
        <q-card-section>
          <q-separator />
          <div class="text-h6 q-mt-md">Tipo de visualização</div>
          <q-option-group
            :options="optionsVisao"
            label="Visão"
            type="radio"
            v-model="visao"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            outline
            label="Atualizar"
            color="primary"
            v-close-popup
            @click="consultarTickets"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div
      style="height: 85vh"
      class="scroll"
    >
      <template
        v-for="(items, key) in sets"
        :key="key"
      >
        <div
          :style="{ height: 800 }"
          class="row q-pa-md q-col-gutter-md q-mb-sm"
        >
          <div
            :class="contentClass"
            v-for="(item, index) in items"
            :key="index"
          >
            <q-card
              bordered
              square
              flat
            >
              <q-item
                v-if="visao === 'U' || visao === 'US'"
                class="text-bold"
                :class="{
                  'bg-negative text-white': definirNomeUsuario(item[0]) === 'Pendente'
                }"
              >
                <!-- <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                  </q-avatar>
                </q-item-section> -->
                <q-item-section>
                  <q-item-label class="text-bold text-h6">{{ definirNomeUsuario(item[0]) }}</q-item-label>
                  <q-item-label
                    caption
                    :class="{
                      'text-white': definirNomeUsuario(item[0]) === 'Pendente'
                    }"
                  >
                    Atendimentos: {{ item.length }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="visao === 'F' || visao === 'FS'"
                class="text-bold"
                :class="{
                  'bg-negative text-white': definirNomeFila(item[0]) === 'Sem Fila'
                }"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ definirNomeFila(item[0]) }}</q-item-label>
                  <q-item-label
                    caption
                    :class="{
                      'text-white': definirNomeFila(item[0]) === 'Sem Fila'
                    }"
                  >
                    Abertos: {{ counterStatus(item).open }} | Pendentes: {{ counterStatus(item).pending }} | Total:
                    {{ item.length }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section
                :style="{ height: '320px' }"
                class="scroll"
                v-if="visao === 'U' || visao === 'F'"
              >
                <ItemTicket
                  v-for="(ticket, i) in item"
                  :key="i"
                  :ticket="ticket"
                  :filas="filas"
                />
              </q-card-section>
            </q-card>
          </div>
          <q-resize-observer @resize="onResize"></q-resize-observer>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { format, sub } from 'date-fns'
import { groupBy } from 'lodash'
import { useQuasar } from 'quasar'
import { notificarErro } from 'src/utils/helpersNotifications'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ConsultarTicketsQueuesService } from '../../service/estatisticas.js'
import { ListarFilas } from '../../service/filas'
import { socketIO } from '../../utils/socket'
import ItemTicket from '../atendimento/ItemTicket.vue'

const $q = useQuasar()
const socket = socketIO()

const usuario = JSON.parse(localStorage.getItem('usuario'))
const profile = localStorage.getItem('profile')
const UserQueues = localStorage.getItem('queues')

const userProfile = ref('user')
const visualizarFiltros = ref(false)
const height = ref(400)
const visao = ref('U')
const tickets = ref([])
const filas = ref([])
const sizes = { lg: 3, md: 3, sm: 2, xs: 1 }

const optionsVisao = [
  { label: 'Por Usuário', value: 'U' },
  { label: 'Por Usuário (Sintético)', value: 'US' },
  { label: 'Por Filas', value: 'F' },
  { label: 'Por Filas (Sintético)', value: 'FS' }
]

const pesquisaTickets = reactive({
  showAll: true,
  dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
  dateEnd: format(new Date(), 'yyyy-MM-dd'),
  queuesIds: []
})

const cTicketsUser = computed(() => {
  const field = visao.value === 'U' || visao.value === 'US' ? 'userId' : 'queueId'
  return [groupBy(tickets.value, field)]
})

const itemsPerSet = computed(() => {
  for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
    if ($q.screen[size] && sizes[size]) {
      return sizes[size]
    }
  }
  return 1
})

const contentClass = computed(() => {
  let cls = 'col'
  const keysLenSize = Object.keys(cTicketsUser.value[0]).length
  for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
    if (sizes[size]) {
      const sizeExpect = sizes[size] > keysLenSize ? keysLenSize : sizes[size]
      cls += ' col-' + size + '-' + 12 / sizeExpect
    }
  }
  return cls
})

const sets = computed(() => {
  const s = []
  const limit = Math.ceil(cTicketsUser.value.length / itemsPerSet.value)
  for (let index = 0; index < limit; index++) {
    const start = index * itemsPerSet.value
    const end = start + itemsPerSet.value
    s.push(cTicketsUser.value.slice(start, end))
  }
  return s[0] || []
})

const cUserQueues = computed(() => {
  try {
    const filasUsuario = JSON.parse(UserQueues)
      .filter(q => q.isActive)
      .map(q => q.id)
    return filas.value.filter(f => filasUsuario.includes(f.id)) || []
  } catch (error) {
    return []
  }
})

const deleteTicket = ticketId => {
  tickets.value = tickets.value.filter(t => t.id !== ticketId)
}

const updateTicket = ticket => {
  const idx = tickets.value.findIndex(t => t.id === ticket.id)
  if (idx !== -1) {
    tickets.value[idx] = ticket
  }
}

const createTicket = ticket => {
  tickets.value.unshift(ticket)
}

const verifyIsActionSocket = data => {
  if (!data?.id) return false
  if (pesquisaTickets.showAll) return true
  if (!filas.value.length) return true

  return pesquisaTickets.queuesIds.includes(data.queueId)
}

const connectSocket = () => {
  // Sockets logic disabled in original, maintaining as is for now
  // but keeping the structure if needed later.
}

const definirNomeUsuario = item => {
  verifyIsActionSocket(item)
  return item?.user?.name || 'Pendente'
}

const definirNomeFila = f => {
  const fila = filas.value.find(fila => fila.id === f.queueId)
  return fila?.queue || 'Sem Fila'
}

const counterStatus = items => {
  const status = { open: 0, pending: 0, closed: 0 }
  const group = groupBy(items, 'status')
  status.open = group.open?.length || 0
  status.pending = group.pending?.length || 0
  status.closed = group.closed?.length || 0
  return status
}

const consultarTickets = () => {
  ConsultarTicketsQueuesService(pesquisaTickets)
    .then(res => {
      tickets.value = res.data
      connectSocket()
    })
    .catch(error => {
      console.error(error)
      notificarErro('Erro ao consultar atendimentos', error)
    })
}

const onResize = ({ height: h }) => {
  height.value = h
}

onMounted(async () => {
  userProfile.value = localStorage.getItem('profile')
  const { data } = await ListarFilas()
  filas.value = data
  consultarTickets()
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style lang="scss" scoped></style>
