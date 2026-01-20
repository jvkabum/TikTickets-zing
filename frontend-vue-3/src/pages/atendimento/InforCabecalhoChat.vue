<template>
  <div>
    <q-header
      class="bg-white text-grey-10 no-border-radius"
      bordered
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
          :color="$q.dark.isActive ? 'white' : ''"
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
            class="q-pl-sm"
          >
            <q-avatar class="bg-grey-3">
              <q-img
                v-if="ticketFocado.contact?.profilePicUrl"
                :src="ticketFocado.contact.profilePicUrl"
              />
              <q-icon
                v-else
                name="mdi-account"
                color="grey-6"
                size="30px"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              class="text-bold"
              lines="1"
            >
              {{ ticketFocado.contact?.name || 'Carregando...' }}
            </q-item-label>
            <q-item-label
              caption
              lines="1"
            >
              <span v-if="ticketFocado.user?.name">Atribuído a: {{ ticketFocado.user.name }}</span>
              <span v-else>Aguardando atribuição</span>
            </q-item-label>
            <q-item-label
              caption
              style="font-size: 10px"
            >
              Ticket: {{ ticketFocado.id }}
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
              @click="atualizarStatusTicket(ticketFocado, 'open')"
              flat
              icon="mdi-reload"
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'open'"
            >
              <q-tooltip>Reabrir Ticket</q-tooltip>
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
              <q-tooltip>Sincronizar Mensagens</q-tooltip>
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
              <q-tooltip>Agendamento</q-tooltip>
            </q-btn>

            <q-btn
              @click="atualizarStatusTicket(ticketFocado, 'pending')"
              flat
              icon="mdi-replay"
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip>Retornar à Fila</q-tooltip>
            </q-btn>

            <q-btn
              @click="atualizarStatusTicket(ticketFocado, 'closed')"
              color="positive"
              flat
              class="btn-rounded"
              icon="mdi-comment-check"
              label="Resolver"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-tooltip>Resolver</q-tooltip>
            </q-btn>

            <q-btn
              @click="abrirTransferencia"
              flat
              color="primary"
              class="btn-rounded"
              :disable="ticketFocado.status === 'closed'"
            >
              <q-icon name="mdi-transfer" />
              <q-tooltip>Transferir</q-tooltip>
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
            label="Escolha a Fila"
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
            label="Escolha o Usuário"
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
const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)
const { atualizarStatusTicket } = useTicketActions()

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)

const usuarioStore = useUsuarioStore()
const { usuarios } = storeToRefs(usuarioStore)

const modalTransferirTicket = ref(false)
const sincronizando = ref(false)
const transferindo = ref(false)

const transferencia = reactive({
  filaId: null,
  usuarioId: null
})

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

const emitirAcaoMenu = () => {
  bus.emit('infor-cabecalo-chat:acao-menu')
}

const emitirInfoContato = () => {
  bus.emit('update-ticket:info-contato')
}
</script>

<style lang="sass" scoped>
.btn-rounded
  border-radius: 8px

.blur-effect
  transition: filter 0.3s ease
</style>
