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

        <q-chat-message
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ 'pulseIdentications text-black': identificarMensagem === `chat-message-${mensagem.id}` }"
        >
          <template #stamp>
            <div class="row items-center no-wrap">
              <span>{{ dataInWords(mensagem.createdAt) }}</span>
              <template v-if="mensagem.mediaUrl && !['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType)">
                <div class="document-stamp-actions">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="open_in_new"
                    size="xs"
                    :href="mensagem.mediaUrl"
                    target="_blank"
                  >
                    <q-tooltip>Abrir</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="download"
                    size="xs"
                    :href="mensagem.mediaUrl"
                    download
                  >
                    <q-tooltip>Baixar</q-tooltip>
                  </q-btn>
                </div>
              </template>
            </div>
          </template>

          <div
            :style="[
              mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : '',
              ['image', 'video'].includes(mensagem.mediaType)
                ? 'min-width: 100px;'
                : 'min-width: 100px; max-width: 500px;'
            ]"
            class="relative-position"
          >
            <!-- Checkbox for Multi-Forwarding -->
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :model-value="mensagensParaEncaminhar.some(m => m.id === mensagem.id)"
              @update:model-value="verificarEncaminharMensagem(mensagem)"
              dense
              class="absolute-top"
              :style="mensagem.fromMe ? 'left: -40px' : 'right: -40px'"
            />

            <!-- Scheduled Icon -->
            <q-icon
              v-if="mensagem.scheduleDate"
              name="mdi-calendar"
              size="18px"
              class="q-ma-xs"
              :class="mensagem.status === 'pending' ? 'text-primary' : 'text-positive'"
            >
              <q-tooltip>
                <div v-if="mensagem.isDeleted">Cancelado em: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}</div>
                <div>Criado em: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}</div>
                <div>Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}</div>
              </q-tooltip>
            </q-icon>

            <!-- Edit/Deleted Labels -->
            <div
              v-if="mensagem.edited"
              class="text-italic text-caption"
            >
              Editada
            </div>
            <div
              v-if="mensagem.isDeleted"
              class="text-italic text-caption"
            >
              Mensagem apagada
            </div>

            <!-- Group Contact Name -->
            <div
              v-if="isGroupLabel(mensagem)"
              class="q-mb-xs text-bold text-primary"
              style="font-size: 0.8rem"
            >
              {{ mensagem.contact?.name }}
            </div>

            <!-- Quoted Message -->
            <div
              v-if="mensagem.quotedMsg"
              class="q-mb-sm bg-grey-3 rounded-borders q-pa-xs cursor-pointer"
              @click="focarMensagem(mensagem.quotedMsg)"
            >
              <MensagemRespondida :mensagem="mensagem.quotedMsg" />
            </div>

            <!-- Message Options Menu -->
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
                    @click="marcarMultiEncaminhamento"
                  >
                    <q-item-section>Selecionar Várias</q-item-section>
                  </q-item>
                  <q-item
                    v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
                    clickable
                    @click="abrirEdicao(mensagem)"
                  >
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-separator />
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

            <!-- Media Renderers -->
            <template v-if="mensagem.mediaType === 'audio'">
              <AudioVisualizer
                :url="mensagem.mediaUrl"
                :contact="mensagem.contact"
                :avatar-src="mensagem.fromMe ? ticketFocado?.whatsapp?.profilePicUrl : mensagem.contact?.profilePicUrl"
              />
            </template>

            <template v-else-if="mensagem.mediaType === 'vcard'">
              <ContatoCard
                :mensagem="mensagem"
                @open-contact-modal="openContactModal"
              />
            </template>

            <template v-else-if="mensagem.mediaType === 'image'">
              <MediaViewer
                media-type="image"
                :media-url="mensagem.mediaUrl"
              />
            </template>

            <template v-else-if="mensagem.mediaType === 'video'">
              <MediaViewer
                media-type="video"
                :media-url="mensagem.mediaUrl"
              />
            </template>

            <template v-else-if="mensagem.mediaType === 'poll_creation'">
              <div class="poll-container q-pa-sm rounded-borders bg-grey-10 text-white">
                <div class="text-bold row items-center no-wrap">
                  <q-icon
                    name="poll"
                    class="q-mr-xs"
                  />
                  {{ mensagem.pollData?.name || 'Enquete' }}
                </div>
                <div class="text-caption opacity-70 q-mb-xs">{{ totalVotes(mensagem) }} votos</div>
                <div
                  v-for="opt in mensagem.pollData?.options"
                  :key="opt.name"
                  class="q-mb-xs"
                >
                  <div class="row items-center justify-between no-wrap">
                    <span class="ellipsis">{{ opt.name }}</span>
                    <span class="text-caption">{{ opt.votes || 0 }}</span>
                  </div>
                  <q-linear-progress
                    :value="getVotePercentage(opt, mensagem.pollData.options) / 100"
                    color="secondary"
                  />
                </div>
              </div>
            </template>

            <!-- Text Content -->
            <div
              v-if="!['vcard', 'audio', 'poll_creation'].includes(mensagem.mediaType) && !isFileNameOnly(mensagem)"
              :class="{ 'q-mt-xs': mensagem.mediaType !== 'chat' }"
              class="q-message-text-content"
              v-html="formatarMensagemWhatsapp(mensagem.body)"
            />

            <!-- Message Status (Ack) -->
            <q-icon
              v-if="mensagem.fromMe"
              :name="ackIcons[mensagem.ack] || 'mdi-clock-outline'"
              size="14px"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :color="mensagem.ack >= 3 ? 'blue-12' : 'grey-7'"
            />
          </div>
        </q-chat-message>
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
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { ListarProtocolos } from 'src/service/protocols'
import { DeletarMensagem, EditarMensagem } from 'src/service/tickets'
import { useTicketStore } from 'src/stores/useTicketStore'
import bus from 'src/utils/eventBus'
import { formatarMensagemWhatsapp } from 'src/utils/formatMessage'
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import ContatoCard from './ContatoCard.vue'
import ContatoModalReduzido from './ContatoModalReduzido.vue'
import MensagemRespondida from './MensagemRespondida.vue'

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

const $q = useQuasar()
const ticketStore = useTicketStore()
const { ticketFocado } = storeToRefs(ticketStore)

const identificarMensagem = ref(null)
const protocolos = ref([])
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
  try {
    const { data } = await ListarProtocolos(ticketFocado.value.id)
    protocolos.value = data || []
  } catch (e) {
    console.error('Erro ao carregar protocolos', e)
  }
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
    const data = await EditarMensagem({ id: modalEdit.id, messageId: modalEdit.messageId, body: modalEdit.body })
    ticketStore.updateMensagem(data)
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
      await DeletarMensagem(m)
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
