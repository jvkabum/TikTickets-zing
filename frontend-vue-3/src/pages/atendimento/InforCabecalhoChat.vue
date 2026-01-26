<template>
  <div>
    <q-header
      class="glass-premium text-grey-10 no-border-radius no-shadow"
      style="z-index: 100; border-bottom: 1px solid rgba(var(--q-primary), 0.1)"
    >
      <q-toolbar
        style="min-height: 60px; height: 60px"
        class="no-border-radius q-pa-none"
      >
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'primary' : 'primary'"
          @click="emitirAcaoMenu"
        />

        <q-item
          clickable
          v-ripple
          class="q-ma-none q-pa-none"
          style="min-height: 60px; height: 60px; width: 300px"
          @click="emitirInfoContato"
        >
          <q-item-section
            avatar
            class="q-pl-md"
          >
            <q-avatar size="44px" class="bg-grey-2 no-shadow">
              <q-img
                :src="ticketFocado.contact?.profilePicUrl || ticketFocado.profilePicUrl || '/default-avatar.png'"
              >
                <template v-slot:error>
                  <q-img src="/default-avatar.png" />
                </template>
              </q-img>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              class="text-bold text-subtitle2"
              lines="1"
            >
              {{ ticketFocado.contact?.name || ticketFocado.name }}
              <q-skeleton v-if="!ticketFocado.contact?.name && !ticketFocado.name" animation="none" style="width: 200px" />
            </q-item-label>
            <q-item-label
              caption
              lines="1"
              class="text-weight-medium"
            >
              <span v-if="ticketFocado.user?.name" class="text-primary">Atendimento: {{ ticketFocado.user.name }}</span>
              <q-skeleton v-else-if="ticketFocado.id && !ticketFocado.user?.name" type="text" class="text-caption" animation="none" style="width: 150px" />
              <span v-else class="text-grey-7">Aguardando atribuição</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-space />

        <div
          class="q-gutter-xs q-pr-sm"
          v-if="ticketFocado.id"
        >
          <!-- Desktop Actions -->
          <template v-if="!$q.screen.xs">
            <q-btn
              @click="sairConversa"
              flat
              icon="mdi-exit-to-app"
              color="grey-7"
              class="btn-rounded"
            >
              <q-tooltip class="bg-grey-9 text-bold">Sair da Conversa</q-tooltip>
            </q-btn>

            <q-btn
              @click="atualizarStatusTicket(ticketFocado, 'open')"
              flat
              icon="mdi-reload"
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'open'"
            >
              <q-tooltip class="bg-primary text-bold">Reabrir Ticket</q-tooltip>
            </q-btn>

            <q-btn
              flat
              icon="sync"
              color="primary"
              class="btn-rounded"
              :loading="sincronizando"
              :disable="ticketFocado.status === 'closed'"
              @click="sincronizarMensagens"
            >
              <q-tooltip class="bg-primary text-bold">Sincronizar Mensagens</q-tooltip>
            </q-btn>

            <q-btn
              @click="$emit('abrir:modalAgendamentoMensagem')"
              v-if="['whatsapp', 'waba'].includes(ticketFocado.channel)"
              flat
              icon="mdi-message-text-clock-outline"
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip class="bg-primary text-bold">Agendamento</q-tooltip>
            </q-btn>

            <q-btn
              @click="atualizarStatusTicket(ticketFocado, 'pending')"
              flat
              icon="mdi-replay"
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip class="bg-primary text-bold">Retornar à Fila</q-tooltip>
            </q-btn>

            <q-btn
              @click="atualizarStatusTicket(ticketFocado, 'closed')"
              color="green"
              flat
              class="btn-rounded"
              icon="mdi-comment-check"
              label="Resolver"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip class="bg-positive text-bold">Resolver</q-tooltip>
            </q-btn>

            <q-btn
              @click="abrirTransferencia"
              flat
              color="primary"
              class="btn-rounded"
              icon="mdi-transfer"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip class="bg-primary text-bold">Transferir</q-tooltip>
            </q-btn>
          </template>

          <!-- Mobile Actions -->
          <template v-else>
            <q-fab
              :disable="ticketFocado.status === 'closed'"
              color="primary"
              flat
              dense
              icon="keyboard_arrow_left"
              direction="down"
              padding="5px"
              label="Ações"
            >
              <q-fab-action
                @click="atualizarStatusTicket(ticketFocado, 'closed')"
                color="positive"
                flat
                icon="mdi-comment-check"
              />
              <q-fab-action
                @click="sincronizarMensagens"
                flat
                icon="sync"
                color="primary"
                :loading="sincronizando"
              />
              <q-fab-action
                @click="atualizarStatusTicket(ticketFocado, 'pending')"
                flat
                icon="mdi-replay"
                color="primary"
              />
              <q-fab-action
                @click="abrirTransferencia"
                flat
                color="primary"
                icon="mdi-transfer"
              />
            </q-fab>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-dialog
      v-model="modalTransferirTicket"
      persistent
    >
      <q-card
        style="width: 500px"
        class="q-pa-md btn-rounded"
      >
        <q-card-section>
          <div class="text-h6">Transferir Ticket</div>
          <div class="text-caption">Selecione o destino da transferência:</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            outlined
            v-model="transferencia.filaId"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            label="Fila de destino"
            dense
          />

          <q-select
            outlined
            v-model="transferencia.usuarioId"
            :options="usuariosFiltrados"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            label="Usuário destino"
            dense
            clearable
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            color="negative"
            flat
            v-close-popup
          />
          <q-btn
            label="Transferir"
            color="primary"
            unelevated
            @click="confirmarTransferencia"
            :loading="transferindo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useTicketActions } from './useTicketActions.js'
import bus from 'src/utils/eventBus'
import { notificarErro, notificarSucesso, notificarInfo } from 'src/utils/helpersNotifications'
import { BuscarTicketPorId } from 'src/service/tickets'

const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const { atualizarStatusTicket } = useTicketActions()

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)

const usuarioStore = useUsuarioStore()
const { usuarios } = storeToRefs(usuarioStore)

const contatoStore = useContatoStore()

const modalTransferirTicket = ref(false)
const sincronizando = ref(false)
const transferindo = ref(false)

const transferencia = reactive({
  filaId: null,
  usuarioId: null
})

// Computed Style para altura dinámica
const style = computed(() => ({
  height: $q.screen.height + 'px'
}))

watch(() => ticketFocado.value, (val) => {
  console.log('DEBUG [InforCabecalhoChat] ticketFocado mudou:', val)
}, { deep: true })

const usuariosFiltrados = computed(() => {
  if (!transferencia.filaId) return usuarios.value
  return usuarios.value.filter(u => u.queues.some(q => q.id === transferencia.filaId))
})

const abrirTransferencia = async () => {
  transferencia.filaId = ticketFocado.value.queueId
  transferencia.usuarioId = ticketFocado.value.userId

  await Promise.all([filaStore.listarFilas(), usuarioStore.listarUsuarios()])

  modalTransferirTicket.value = true
}

const confirmarTransferencia = async () => {
  if (!transferencia.filaId) {
    notificarInfo('Selecione uma fila de destino.')
    return
  }

  if (ticketFocado.value.userId === transferencia.usuarioId && ticketFocado.value.queueId === transferencia.filaId) {
    notificarInfo('O ticket já está nesta fila e com este usuário.')
    return
  }

  transferindo.value = true
  try {
    const status = transferencia.usuarioId ? 'open' : 'pending'
    await ticketStore.atualizarTicket(ticketFocado.value.id, {
      userId: transferencia.usuarioId,
      queueId: transferencia.filaId,
      status: status,
      isTransference: 1
    })

    notificarSucesso('Ticket transferido com sucesso.')
    modalTransferirTicket.value = false
    ticketStore.setTicketFocado({})
  } catch (error) {
    notificarErro('Erro ao transferir ticket', error)
  } finally {
    transferindo.value = false
  }
}

const sincronizarMensagens = async () => {
  sincronizando.value = true
  try {
    await ticketStore.sincronizarMensagens(ticketFocado.value.id)
    notificarSucesso('Mensagens sincronizadas!')
  } catch (error) {
    notificarErro('Erro ao sincronizar', error)
  } finally {
    sincronizando.value = false
  }
}

const sairConversa = () => {
  ticketStore.setTicketFocado({})
}

const emitirAcaoMenu = () => {
  bus.emit('infor-cabecalo-chat:acao-menu')
}

const emitirInfoContato = () => {
  console.log('DEBUG [InforCabecalhoChat] CLICK: alternando drawerContact via Store. Anterior:', ticketStore.drawerContact)
  ticketStore.drawerContact = !ticketStore.drawerContact
}

watch(() => ticketFocado.value, (val) => {
  console.log('DEBUG [InforCabecalhoChat] ticketFocado mudou:', JSON.parse(JSON.stringify(val)))
}, { deep: true })

onMounted(() => {
})

// Carregar protocolos e informações do contato quando trocar o ticket
const initChat = async () => {
  if (ticketFocado.value.id) {
    // Buscar protocolos
    ticketStore.listarProtocolos(ticketFocado.value.id)
    
    // Buscar dados completos do ticket (Agendamentos, etc)
    try {
      const { data: ticketCompleto } = await BuscarTicketPorId(ticketFocado.value.id)
      console.log('DEBUG [InforCabecalhoChat] Ticket Completo (Vindo da API):', ticketCompleto)
      ticketStore.updateTicket(ticketCompleto)
    } catch (err) {
      console.error('Erro ao buscar dados completos do ticket:', err)
    }

    // Carregar informações detalhadas do contato (Info Extra, Tags, etc)
    if (ticketFocado.value.contactId) {
      try {
        const fullContact = await contatoStore.obterContato(ticketFocado.value.contactId)
        console.log('DEBUG [InforCabecalhoChat] Contato Completo (Vindo da API):', fullContact)
        if (fullContact) {
          // Atualizar o ticket localmente com o novo contato completo para popular painel lateral
          ticketStore.updateTicketContact(fullContact)
        }
      } catch (err) {
        console.error('Erro ao buscar info contato no cabecalho:', err)
      }
    }
  }
}

watch(() => ticketFocado.value.id, initChat)
onMounted(initChat)
</script>

<style lang="sass" scoped>
.btn-rounded
  border-radius: 0px

.blur-effect
  transition: filter 0.3s ease
</style>
