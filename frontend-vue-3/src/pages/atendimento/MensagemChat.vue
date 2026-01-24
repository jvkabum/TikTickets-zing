<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <template
        v-for="(mensagem, index) in mensagens"
        :key="mensagem.id || index"
      >
        <!-- Divisores de protocolo (Gaps entre mensagens) -->
        <template v-for="p in obterProtocolosExibir(mensagem, index)" :key="'prot-' + p.id">
          <div
            class="hr-text q-mt-lg q-mb-md"
            :class="p.status === 'ABER' ? 'protocolo-aberto' : 'protocolo-fechado'"
          >
            <span>{{ obterTextoProtocolo(p) }}</span>
          </div>
        </template>

        <!-- Divisor de data -->
        <template
          v-if="
            isLineDate &&
            (index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt))
          "
        >
          <div
            :key="'hr-date-' + index"
            class="hr-text hr-date q-mt-lg q-mb-md"
          >
            <span>{{ formatarData(mensagem.createdAt) }}</span>
          </div>
        </template>

        <div class="message-container q-mb-sm" :class="mensagem.fromMe ? 'items-end' : 'items-start'">
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
      </template>

      <!-- Divisores de protocolo FINAIS (Protocolos sem mensagens posteriores) -->
      <template v-for="p in obterProtocolosFinais()" :key="'prot-final-' + p.id">
        <div
          class="hr-text q-mt-lg q-mb-md"
          :class="p.status === 'ABER' ? 'protocolo-aberto' : 'protocolo-fechado'"
        >
          <span>{{ obterTextoProtocolo(p) }}</span>
        </div>
      </template>
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
import { format, parseISO, isValid as isValidDate } from 'date-fns'
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

const parseData = (valor) => {
  if (!valor) return null
  if (valor instanceof Date) return valor
  if (typeof valor === 'number' || (typeof valor === 'string' && !isNaN(Number(valor)))) {
    const n = Number(valor)
    return new Date(n > 10000000000 ? n : n * 1000)
  }
  try { return parseISO(valor) } catch (e) { return new Date(valor) }
}

const formatarData = (data, formato = 'dd/MM/yyyy') => {
  const d = parseData(data)
  return d && isValidDate(d) ? format(d, formato, { locale: pt }) : ''
}

const carregarProtocolos = async () => {
  if (!ticketFocado.value.id) return
  await ticketStore.listarProtocolos(ticketFocado.value.id)
}

const getProtocoloMensagem = msgDate => {
  if (!protocolos.value?.length) return null
  const date = parseData(msgDate)?.getTime()
  if (!date) return protocolos.value[0] // Fallback para o primeiro se data for inválida

  const filtrados = protocolos.value
    .filter(p => {
      const pDate = parseData(p.createdAt)?.getTime()
      return pDate && pDate <= date
    })
    .sort((a, b) => {
      const dateA = parseData(a.createdAt)?.getTime() || 0
      const dateB = parseData(b.createdAt)?.getTime() || 0
      return dateB - dateA
    })
  
  // Se não achou nenhum protocolo ANTES da mensagem, mas existem protocolos, 
  // pega o primeiro de abertura (provavelmente é o protocolo deste atendimento)
  return filtrados.length ? filtrados[0] : protocolos.value[0]
}

const obterProtocolosExibir = (mensagem, index) => {
  if (!protocolos.value?.length) return []
  const dateMsg = parseData(mensagem.createdAt)?.getTime()
  if (!dateMsg) return []

  const dateMsgAnterior = index > 0 
    ? parseData(props.mensagens[index - 1].createdAt)?.getTime() 
    : 0

  return protocolos.value.filter(p => {
    const pDate = parseData(p.createdAt)?.getTime()
    // Protocolos que aconteceram entre a msg anterior e a atual
    return pDate && pDate > dateMsgAnterior && pDate <= dateMsg
  }).sort((a, b) => parseData(a.createdAt).getTime() - parseData(b.createdAt).getTime())
}

const obterProtocolosFinais = () => {
  if (!protocolos.value?.length || !props.mensagens.length) return []
  const ultimaMsgDate = parseData(props.mensagens[props.mensagens.length - 1].createdAt)?.getTime()
  
  return protocolos.value.filter(p => {
    const pDate = parseData(p.createdAt)?.getTime()
    return pDate && pDate > ultimaMsgDate
  }).sort((a, b) => parseData(a.createdAt).getTime() - parseData(b.createdAt).getTime())
}

const obterTextoProtocolo = p => {
  if (!p) return 'Protocolo'
  
  const statusIcon = p.status === 'ABER' ? '🟢' : '🔴'
  const tipo = p.status === 'ABER' ? 'abertura' : 'fechamento'
  
  // Tentar extrair o número do protocolo de várias chaves possíveis (segurança)
  const num = p.protocolNumber || p.number || p.id || '---'
  const numLimpo = num.toString().replace(/[()]/g, '')
  
  // Tentar extrair o nome do usuário de várias chaves possíveis
  const user = p.userName || p.user?.name || 'Sistema'
  
  const data = formatarData(p.createdAt, 'dd/MM/yy')
  const hora = formatarData(p.createdAt, 'HH.mm')
  
  return `${statusIcon} (Protocolo ${numLimpo}) - (${tipo} ${data} as ${hora} Por ${user})`
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

// NOVO: Monitorar mudança de status para recarregar protocolos (para quando fechar o atendimento)
watch(
  () => ticketFocado.value.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'closed' && oldStatus !== 'closed') {
      console.log('[Protocolo] Status mudou para fechado, recarregando protocolos...')
      carregarProtocolos()
    }
    // Opcional: recarregar se reabrir também
    if (newStatus === 'open' && oldStatus === 'closed') {
      carregarProtocolos()
    }
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

/* Fix para alinhamento das bolhas no container do v-for */
.message-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 4px !important;
}

/* Classes para forçar alinhamento correto dos bubbles */
.justify-end {
  align-items: flex-end;
}

.justify-start {
  align-items: flex-start;
}

/* Estilo para Divisores de Protocolo e Data */
.hr-text {
  line-height: 1.5em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: 0.9;
  margin: 15px 0 !important;
  width: 100%;

  &:before {
    content: '';
    background: linear-gradient(to right, transparent, var(--protocolo-cor, #818078), transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    opacity: 0.8;
  }

  &.hr-date:before {
    display: none;
  }

  span {
    position: relative;
    display: inline-block;
    padding: 4px 15px;
    line-height: 1.5em;
    color: var(--protocolo-texto, #444);
    background: var(--protocolo-fundo, #eee);
    font-weight: 700;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 11px;
    z-index: 10;

    body.body--dark & {
      background: var(--protocolo-fundo, #1d1d1d);
      border-color: rgba(255, 255, 255, 0.05);
      color: var(--protocolo-texto, #fcfcfa);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
  }

  &.protocolo-aberto {
    --protocolo-cor: #2e7d32;
    --protocolo-texto: #1b5e20;
    --protocolo-fundo: #e8f5e9;
    
    body.body--dark & {
      --protocolo-cor: #81C784;
      --protocolo-texto: #C8E6C9;
      --protocolo-fundo: #1B5E20;
    }
  }

  &.protocolo-fechado {
    --protocolo-cor: #c62828;
    --protocolo-texto: #b71c1c;
    --protocolo-fundo: #ffebee;
    
    body.body--dark & {
      --protocolo-cor: #E57373;
      --protocolo-texto: #FFCDD2;
      --protocolo-fundo: #B71C1C;
    }
  }
}
</style>
