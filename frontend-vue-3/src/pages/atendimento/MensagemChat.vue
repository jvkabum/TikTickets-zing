<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        v-for="(mensagem, index) in mensagens"
        :key="mensagem.id || index"
      >
        <!-- Divisor de protocolo -->
        <hr
          v-if="mostrarDivisorProtocolo(mensagem, index)"
          :key="'hr-protocol-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :class="
            getProtocoloMensagem(new Date(mensagem.createdAt))?.status === 'ABER'
              ? 'protocolo-aberto'
              : 'protocolo-fechado'
          "
          :data-content="obterTextoProtocolo(getProtocoloMensagem(new Date(mensagem.createdAt)))"
        />

        <!-- Divisor de data -->
        <hr
          v-if="
            isLineDate &&
            (index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt))
          "
          :key="'hr-date-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
        />

        <!-- Anchor for scrolling/identification -->
        <div :id="`chat-message-${mensagem.id}`" />

        <MessageBubble
          :key="mensagem.id"
          :body="mensagem.body"
          :from-me="mensagem.fromMe"
          :timestamp="mensagem.createdAt"
          :ack="mensagem.ack"
          :contact-name="mensagem.contact?.name"
          :show-header="isGroupLabel(mensagem)"
          :quoted-message="mensagem.quotedMsg"
          :is-deleted="mensagem.isDeleted"
          class="text-weight-medium"
          :class="{ 'pulseIdentications text-black': identificarMensagem === `chat-message-${mensagem.id}` }"
          @quote-click="focarMensagem"
        >
          <template #media>
            <MessageMediaDisplay
              :mensagem="mensagem"
              :media-type="mensagem.mediaType"
              :media-url="mensagem.mediaUrl"
              :is-deleted="mensagem.isDeleted"
              :contact="mensagem.contact"
              :from-me="mensagem.fromMe"
              :my-avatar="ticketFocado?.whatsapp?.profilePicUrl"
              :contact-avatar="mensagem.contact?.profilePicUrl"
              @open-contact-modal="openContactModal"
            >
              <template #checkbox-forward>
                 <q-checkbox
                  v-if="ativarMultiEncaminhamento"
                  :model-value="mensagensParaEncaminhar.some(m => m.id === mensagem.id)"
                  @update:model-value="(val) => selecionarMensagem(val, mensagem)"
                  class="absolute-top-right z-top"
                  style="right: -10px; top: -10px"
                  dense
                  color="blue"
                />
              </template>
              <template #options-menu>
                <q-btn
                v-if="!mensagem.isDeleted && isShowOptions"
                flat
                round
                dense
                icon="mdi-chevron-down"
                class="absolute-top-right mostar-btn-opcoes-chat"
                size="sm"
              >
                <q-menu auto-close>
                  <q-list dense>
                    <q-item
                      clickable
                      @click="citarMensagem(mensagem)"
                    >
                      <q-item-section>Responder</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="encaminharMensagem(mensagem)"
                    >
                      <q-item-section>Encaminhar</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="marcarMensagem(mensagem)"
                    >
                      <q-item-section>Marcar</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
                      clickable
                      @click="editarMensagem(mensagem)"
                    >
                      <q-item-section>Editar</q-item-section>
                    </q-item>
                    <q-item
                      v-if="mensagem.fromMe"
                      clickable
                      @click="confirmarDelecao(mensagem)"
                    >
                      <q-item-section class="text-negative">Deletar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              </template>
            </MessageMediaDisplay>          </template>
        </MessageBubble>
      </div>
    </transition-group>

    <!-- Scroll Bottom Fab -->
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="keyboard_arrow_down"
        color="primary"
      />
    </q-page-scroller>

    <!-- Edit Dialog -->
    <q-dialog
      v-model="modalEdit.show"
      persistent
    >
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Editar Mensagem</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="modalEdit.body"
            outlined
            autogrow
            label="Mensagem"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
          />
          <q-btn
            color="primary"
            label="Salvar"
            @click="confirmarEdicao"
            :loading="modalEdit.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ContatoModalReduzido
      v-model="modalContato.show"
      :contact="modalContato.data"
    />
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { formatarMensagemWhatsapp } from 'src/utils/formatMessage'
import InforCabecalhoChat from './InforCabecalhoChat.vue'
import MessageBubble from 'src/components/chat/MessageBubble.vue'
import MessageMediaDisplay from 'src/components/atendimento/MessageMediaDisplay.vue'
import ContatoModalReduzido from 'src/pages/atendimento/ContatoModalReduzido.vue'

const ticketStore = useTicketStore()
const { ticketFocado, protocolos } = storeToRefs(ticketStore)
const $q = useQuasar()

import bus from 'src/utils/eventBus'

const props = defineProps({
  mensagens: { type: Array, default: () => [] },
  isLineDate: { type: Boolean, default: true },
  isShowOptions: { type: Boolean, default: true },
  ativarMultiEncaminhamento: { type: Boolean, default: false },
  mensagensParaEncaminhar: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:replyingMessage',
  'mensagem-chat:encaminhar-mensagem',
  'update:ativarMultiEncaminhamento',
  'update:mensagensParaEncaminhar'
])

const identificarMensagem = ref(null)
const modalEdit = reactive({ show: false, body: '', id: null, loading: false, messageId: null })
const modalContato = reactive({ show: false, data: {} })

const ackIcons = {
  0: 'mdi-clock-outline',
  1: 'mdi-check',
  2: 'mdi-check-all',
  3: 'mdi-check-all',
  4: 'mdi-check-all'
}

const formatarData = (data, formato = 'dd/MM/yyyy') => (data ? format(parseISO(data), formato, { locale: pt }) : '')
const dataInWords = data => (data ? format(parseISO(data), 'HH:mm', { locale: pt }) : '')

const carregarProtocolos = async () => {
  if (!ticketFocado.value.id) return
  await ticketStore.listarProtocolos(ticketFocado.value.id)
}

const getProtocoloMensagem = msgDate => {
  if (!protocolos.value.length) return null
  const date = new Date(msgDate).getTime()
  return protocolos.value
    .filter(p => new Date(p.createdAt).getTime() <= date)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
}

const mostrarDivisorProtocolo = (mensagem, index) => {
  if (!protocolos.value.length) return false
  if (index === 0) return true
  const pAtual = getProtocoloMensagem(mensagem.createdAt)
  const pAnterior = getProtocoloMensagem(props.mensagens[index - 1].createdAt)
  return pAtual?.id !== pAnterior?.id
}

const obterTextoProtocolo = p => {
  if (!p) return ''
  const icon = p.status === 'ABER' ? '🟢' : '🔴'
  const status = p.status === 'ABER' ? 'abertura' : 'fechamento'
  return `${icon} Protocolo ${p.protocolNumber} (${status} ${formatarData(p.createdAt, 'dd/MM/yy HH:mm')} by ${p.userName || 'System'})`
}

const isGroupLabel = m => ticketFocado.value.isGroup && !m.fromMe && m.contact?.name

const isFileNameOnly = m => {
  if (!m.mediaUrl || !m.body) return false
  const filename = m.mediaUrl.split('/').pop()
  return m.body === filename || m.body.length < 5 // Common for automated filenames
}

const citarMensagem = m => {
  emit('update:replyingMessage', m)
  bus.emit('mensagem-chat:focar-input-mensagem', m)
}

const encaminharMensagem = m => emit('mensagem-chat:encaminhar-mensagem', m)

const marcarMultiEncaminhamento = () => {
  emit('update:ativarMultiEncaminhamento', true)
  emit('update:mensagensParaEncaminhar', [])
}

const verificarEncaminharMensagem = m => {
  const selecionadas = [...props.mensagensParaEncaminhar]
  const idx = selecionadas.findIndex(msg => msg.id === m.id)
  if (idx > -1) selecionadas.splice(idx, 1)
  else {
    if (selecionadas.length >= 10) return $q.notify({ type: 'warning', message: 'Máximo 10 mensagens' })
    selecionadas.push(m)
  }
  emit('update:mensagensParaEncaminhar', selecionadas)
}

const abrirEdicao = m => {
  modalEdit.id = m.id
  modalEdit.messageId = m.messageId
  modalEdit.body = m.body
  modalEdit.show = true
}

const confirmarEdicao = async () => {
  modalEdit.loading = true
  try {
    await ticketStore.editarMensagem({
      id: modalEdit.id,
      messageId: modalEdit.messageId,
      body: modalEdit.body
    })
    modalEdit.show = false
  } catch (e) {
    console.error(e)
  } finally {
    modalEdit.loading = false
  }
}

const confirmarDelecao = m => {
  $q.dialog({
    title: 'Apagar Mensagem?',
    message: 'A mensagem será removida do sistema e do cliente (se suportado).',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await ticketStore.deletarMensagem(m)
      m.isDeleted = true // Local update for reactivity if store hasn't updated yet
    } catch (e) {
      console.error(e)
    }
  })
}

const focarMensagem = m => {
  const id = `chat-message-${m.id || m.messageId}`
  identificarMensagem.value = id
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  })
  setTimeout(() => (identificarMensagem.value = null), 3000)
}

const totalVotes = m => m.pollData?.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0
const getVotePercentage = (o, opts) => {
  const total = opts.reduce((s, opt) => s + (opt.votes || 0), 0)
  return total ? Math.round((o.votes * 100) / total) : 0
}

const openContactModal = c => {
  modalContato.data = c
  modalContato.show = true
}

watch(
  () => ticketFocado.value.id,
  newId => {
    if (newId) carregarProtocolos()
  }
)

onMounted(carregarProtocolos)
</script>

<style lang="scss">
.mostar-btn-opcoes-chat {
  display: none;
  z-index: 2;
  background: rgba(255, 255, 255, 0.8);
}
.q-chat-message:hover .mostar-btn-opcoes-chat {
  display: block;
}
.pulseIdentications {
  animation: pulse 1.5s infinite;
  background-color: #fff9c4 !important;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
.poll-container {
  min-width: 250px;
}
</style>
