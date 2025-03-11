<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-for="(mensagem, index) in mensagens" :key="index">
        <!-- Divisor de protocolo -->
        <hr
          v-if="mostrarDivisorProtocolo(mensagem, index)"
          :key="'hr-protocol-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :class="getProtocoloMensagem(new Date(mensagem.createdAt))?.status === 'ABER' ? 'protocolo-aberto' : 'protocolo-fechado'"
          :data-content="obterTextoProtocolo(getProtocoloMensagem(new Date(mensagem.createdAt)))"
        >
        <!-- Divisor de data -->
        <hr
          v-if="isLineDate"
          :key="'hr-date-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        >
        <div
          v-if="mensagens.length && index === mensagens.length - 1"
          :key="`ref-${mensagem.createdAt}`"
          ref="lastMessageRef"
          id="lastMessageRef"
          style="float: left; background: black; clear: both;"
        />
        <div
          :key="`chat-message-${mensagem.id}`"
          :id="`chat-message-${mensagem.id}`"
        />
        <q-chat-message
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem == `chat-message-${mensagem.id}` }"
        >
          <template v-slot:stamp>
            <div class="row items-center no-wrap">
              <span>{{ dataInWords(mensagem.createdAt) }}</span>
              <template v-if="!['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType) && mensagem.mediaUrl">
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
                    <q-tooltip>Abrir em nova aba</q-tooltip>
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
                    <q-tooltip>Baixar arquivo</q-tooltip>
                  </q-btn>
                </div>
              </template>
            </div>
          </template>
          <div
            :style="[
              mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : '',
              mensagem.mediaType === 'image' || mensagem.mediaType === 'video'
                ? 'min-width: 100px;'
                : 'min-width: 100px; max-width: 500px;'
            ]"
          >
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                  'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                  'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe
                }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click.native="verificarEncaminharMensagem(mensagem)"
              :value="false"
            />

            <q-icon
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                  'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                  'text-positive': !['pending', 'canceled'].includes(mensagem.status)
                }"
              v-if="mensagem.scheduleDate"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">
                  Mensagem agendada
                </div>
                <div
                  class="row col"
                  v-if="mensagem.isDeleted"
                >
                  <q-chip
                    color="red-3"
                    icon="mdi-trash-can-outline"
                  >
                    Envio cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip
                    color="blue-1"
                    icon="mdi-calendar-import"
                  >
                    Criado em: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip
                    color="blue-1"
                    icon="mdi-calendar-start"
                  >
                    Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>
            <div v-if="mensagem.edited" class="text-italic">
              Editada: {{ mensagem.edited }}
            </div>
            <div v-if="mensagem.edited" class="text-italic">
              Mensagem anterior:<br>
            </div>
            <div
              v-if="mensagem.isDeleted"
              class="text-italic"
            >
              Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div>
            <div
              v-if="isGroupLabel(mensagem)"
              class="q-mb-sm"
              style="display: flex; color: rgb(59 23 251); fontWeight: 500;"
            >
              {{ isGroupLabel(mensagem) }}
            </div>
            <div
              v-if="mensagem.quotedMsg"
              :class="{ 'textContentItem': !mensagem.isDeleted, 'textContentItemDeleted': mensagem.isDeleted }"
            >
              <MensagemRespondida
                style="max-width: 400px; max-height: 600px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>
            <q-btn
              v-if="!mensagem.isDeleted && isShowOptions"
              class="absolute-top-right mostar-btn-opcoes-chat"
              style="right: 4px; top: 4px;"
              dense
              flat
              ripple
              round
              icon="mdi-chevron-down"
            >
              <q-menu
                square
                auto-close
                anchor="bottom left"
                self="top left"
              >
                <q-list style="min-width: 100px">
                  <q-item
                    :disable="!['whatsapp', 'telegram'].includes(ticketFocado.channel)"
                    clickable
                    @click="citarMensagem(mensagem)"
                  >
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if="!['whatsapp', 'telegram'].includes(ticketFocado.channel)">
                      Disponível apenas para WhatsApp e Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item
                    clickable
                    @click="encaminharMensagem(mensagem)"
                  >
                    <q-item-section>Encaminhar</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="marcarMensagensParaEncaminhar(mensagem)"
                  >
                    <q-item-section>Marcar (encaminhar várias)</q-item-section>
                  </q-item>
                  <q-item
                    @click="AbrirmodaleditarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Editar Mensagem</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    @click="deletarMensagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe"
                    :disable="isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Deletar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon
              v-if="mensagem.fromMe"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name="ackIcons[mensagem.ack]"
              size="1.2em"
              :color="mensagem.ack >= 3 ? 'blue-12' : ''"
            />
            <template v-if="mensagem.mediaType === 'audio'">
              <AudioVisualizer
                :url="mensagem.mediaUrl"
                :contact="mensagem.contact"
                :avatar-src="mensagem.fromMe ? ticketFocado?.whatsapp?.profilePicUrl : mensagem.contact?.profilePicUrl"
              />
            </template>
            <template v-if="mensagem.mediaType === 'vcard'">
              <div style="min-width: 250px;">
                <ContatoCard
                  :mensagem="mensagem"
                  @openContactModal="openContactModal"
                />
                <ContatoModal
                  :value="modalContato"
                  :contact="currentContact"
                  @close="closeModal"
                  @saveContact="saveContact"
                />
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'location'">
              <q-img
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = false"
                src="../../assets/localizacao.png"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
            </template>
            <template v-if="mensagem.mediaType === 'code' || isCodeFile(mensagem.mediaUrl)">
              <div class="media-container">
                <CodeViewer
                  :code="mensagem.mediaType === 'code' ? mensagem.body : mensagem.mediaUrl"
                  :file-name="mensagem.fileName || mensagem.mediaUrl?.split('/')?.pop() || ''"
                  :file-type="getFileExtension(mensagem.fileName || mensagem.mediaUrl)"
                />
              </div>
            </template>
            <template v-else-if="mensagem.mediaType === 'image'">
              <div class="media-container">
                <MediaViewer
                  mediaType="image"
                  :mediaUrl="mensagem.mediaUrl"
                />
              </div>
            </template>
            <template v-else-if="mensagem.mediaType === 'video' && !isCodeFile(mensagem.mediaUrl)">
              <div class="media-container">
                <MediaViewer
                  mediaType="video"
                  :mediaUrl="mensagem.mediaUrl"
                />
              </div>
            </template>
            <template v-else-if="!['audio', 'vcard', 'image', 'video', 'code'].includes(mensagem.mediaType) && mensagem.mediaUrl && !isCodeFile(mensagem.mediaUrl)">
              <div class="media-container">
                <MediaViewer
                  mediaType="document"
                  :mediaUrl="mensagem.mediaUrl"
                  :mediaName="isPDF(mensagem.mediaUrl) ? '' : (mensagem.mediaName || mensagem.body)"
                />
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'poll_creation'">
              <div class="poll-container">
                <div class="poll-header">
                  <q-icon name="poll" size="24px" class="q-mr-sm" />
                  <div class="poll-title">
                    {{ mensagem.pollData?.name || 'Enquete' }}
                  </div>
                </div>
                <div class="poll-subtitle">
                  {{ mensagem.pollData?.options?.length || 0 }} opções disponíveis
                  <span v-if="totalVotes > 0" class="poll-total-votes">
                    • {{ totalVotes }} {{ totalVotes === 1 ? 'voto' : 'votos' }}
                  </span>
                </div>
                <div v-if="mensagem.pollData?.options?.length > 0" class="poll-options">
                  <div v-for="(option, index) in mensagem.pollData.options" :key="index" class="poll-option">
                    <div class="poll-option-content">
                      <div class="poll-option-info">
                        <span class="poll-option-text">{{ option.name }}</span>
                        <span class="poll-option-votes">{{ option.votes || 0 }} {{ (option.votes || 0) === 1 ? 'voto' : 'votos' }}</span>
                      </div>
                      <div class="poll-option-progress" :style="{ width: `${getVotePercentage(option, mensagem.pollData.options)}%` }" />
                    </div>
                  </div>
                </div>
                <div v-else class="poll-no-options">
                  Nenhuma opção disponível
                </div>
                <div class="poll-footer">
                  <q-btn
                    flat
                    color="white"
                    :label="mensagem.pollData?.options?.length > 0 ? 'Mostrar votos' : 'Enquete sem opções'"
                    no-caps
                    class="full-width"
                    align="left"
                    icon="mdi-chart-bar"
                  />
                </div>
              </div>
            </template>
            <div
              v-linkified
              v-if="!['vcard', 'application', 'audio'].includes(mensagem.mediaType) && !isFileNameOnly(mensagem)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap"
            >
              <div v-html="formatarMensagemWhatsapp(mensagem.body)"></div>
            </div>
          </div>
        </q-chat-message>
      </div>
    </transition-group>
    <!-- Botão flutuante -->
    <button
      v-if="showScrollToBottom"
      class="scroll-to-bottom"
      @click="scrollToBottom"
    >
      ⬇️
    </button>
    <q-dialog v-model="showModaledit">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Mensagem</div>
        </q-card-section>
        <q-card-section>
          <q-input filled v-model="mensagemAtual.body" label="Mensagem" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Salvar" color="primary" @click="salvarMensagem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { Base64 } from 'js-base64'
import AudioVisualizer from '../../components/AudioVisualizer.vue'
import MediaViewer from '../../components/MediaViewer'
import MensagemRespondida from './MensagemRespondida'
import ContatoCard from './ContatoCard.vue'
import ContatoModal from './ContatoModal.vue'
import { DeletarMensagem, EditarMensagem } from 'src/service/tickets'
import { ListarProtocolos } from 'src/service/protocols'
import mixinCommon from './mixinCommon'
import CodeViewer from '../../components/CodeViewer.vue'
import { formatarMensagemWhatsapp } from '../../utils/format'

const downloadImageCors = axios.create({
  baseURL: process.env.VUE_URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})

export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagem: {
      type: Object,
      required: true
    },
    mensagens: {
      type: Array,
      default: () => []
    },
    mensagensParaEncaminhar: {
      type: Array,
      default: () => []
    },
    size: {
      type: [String, Number],
      default: '5'
    },
    isLineDate: {
      type: Boolean,
      default: true
    },
    isShowOptions: {
      type: Boolean,
      default: true
    },
    ativarMultiEncaminhamento: {
      type: Boolean,
      default: false
    },
    replyingMessage: {
      type: Object,
      default: () => {}
    },
    ticketId: {
      type: [String, Number],
      required: true,
      validator: function (value) {
        if (typeof value === 'string') {
          const numero = parseInt(value, 10)
          const valido = !isNaN(numero) && numero > 0
          return valido
        }
        if (typeof value === 'number') {
          const valido = value > 0
          return valido
        }
        return false
      }
    }
  },
  data () {
    return {
      modalContato: false,
      currentContact: {},
      mensagemAtual: { body: '' },
      showModaledit: false,
      identificarMensagem: null,
      selectedPollOption: null,
      protocolos: [],
      carregandoProtocolos: false,
      ticketIdChecks: 0,
      ackIcons: {
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all'
      }
    }
  },
  components: {
    AudioVisualizer,
    MediaViewer,
    MensagemRespondida,
    ContatoCard,
    ContatoModal,
    CodeViewer
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    ticketIdValido () {
      if (!this.ticketId) return false
      const numero = parseInt(this.ticketId, 10)
      const valido = !isNaN(numero) && numero > 0
      return valido
    }
  },
  watch: {
    ticketId: {
      immediate: true,
      handler (novoId, antigoId) {
        if (novoId === null || novoId === undefined) {
          this.protocolos = []
          return
        }
        const numeroId = typeof novoId === 'string' ? parseInt(novoId, 10) : novoId
        if (typeof numeroId !== 'number' || isNaN(numeroId) || numeroId <= 0) {
          this.protocolos = []
          return
        }
        this.$nextTick(() => {
          this.checkTicketIdStatus()
        })
      }
    }
  },
  methods: {
    formatarMensagemWhatsapp,
    isPDF (url) {
      if (!url || typeof url !== 'string') return false
      try {
        return url.toLowerCase().endsWith('.pdf')
      } catch (error) {
        return false
      }
    },
    isFileNameOnly (mensagem) {
      if (!mensagem || !mensagem.body || mensagem.body.trim() === '') return false

      // Verifica se é um tipo de mídia que queremos esconder o nome
      const isMediaType = ['image', 'video'].includes(mensagem.mediaType) || this.isPDF(mensagem.mediaUrl)
      if (!isMediaType) return false

      try {
        // NOVA VERIFICAÇÃO: Verifica se o texto é igual ao de mensagens anteriores recentes
        // Isso evita a duplicação de textos de mensagens anteriores como legendas
        if (this.mensagens && this.mensagens.length > 0) {
          const index = this.mensagens.findIndex(m => m.id === mensagem.id)
          if (index > 0) {
            // Verifica as últimas 3 mensagens anteriores
            const maxCheck = Math.min(3, index)
            for (let i = 1; i <= maxCheck; i++) {
              const prevMsg = this.mensagens[index - i]
              // Se o texto da mensagem atual for igual ao de uma mensagem anterior recente
              if (prevMsg && prevMsg.body && prevMsg.body.trim() === mensagem.body.trim()) {
                return true // Oculta o texto, pois é uma duplicação
              }
            }
          }
        }

        // Para textos curtos (menos de 50 caracteres) em mensagens de mídia
        if (mensagem.body.length < 50 && !mensagem.body.includes('\n')) {
          if (!/(📱|💬|🗨️|📢|📣|📊|🎉|🎊|🎯|🏆|🔔|⚡|💥|👉|👆|👇|👈|⭐|🌟|💫)/u.test(mensagem.body) &&
              !/(olá|ola|bom dia|boa tarde|boa noite|veja|confira|assista|confere|vê|obrigado|obrigada|valeu|beleza|ok)/i.test(mensagem.body)) {
            return true
          }
        }

        // Padrões para detectar nomes de arquivo
        const patterns = [
          // DALL·E e variações
          /^DALL·E/i,
          /^DALL-E/i,
          /^DALLE/i,

          // Imagens: extensões comuns
          /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i,

          // Vídeos: extensões comuns
          /\.(mp4|mov|avi|mkv|wmv|flv|webm|m4v)$/i,

          // PDFs
          /\.pdf$/i,

          // Padrões de nomenclatura de arquivos
          /^\d{10,14}\.(jpg|jpeg|png|mp4|pdf)/i,
          /^IMG_\d{4,}\.(?:jpg|png|jpeg)/i,
          /^VID_\d{4,}\.(?:mp4|mov)/i,
          /^image_\d+\.(?:jpg|png|jpeg)/i,
          /^video_\d+\.(?:mp4|mov)/i,

          // Padrões para nomes de arquivo criados por IA
          /creative alternative to a standard/i,
          /placeholder profile picture/i,
          /design includes/i
        ]

        // Verifica se o texto corresponde a algum dos padrões de nome de arquivo
        for (const pattern of patterns) {
          if (pattern.test(mensagem.body)) {
            return true
          }
        }

        // Se tiver URL de mídia, compara com o nome do arquivo
        if (mensagem.mediaUrl) {
          const fileName = mensagem.mediaUrl.split('/').pop()
          const bodyWithoutExtension = mensagem.body.replace(/\.[^.]+$/, '')
          const fileNameWithoutExtension = fileName.replace(/\.[^.]+$/, '')

          if (mensagem.body === fileName ||
              bodyWithoutExtension === fileNameWithoutExtension ||
              mensagem.body.includes(fileNameWithoutExtension) ||
              fileNameWithoutExtension.includes(bodyWithoutExtension)) {
            return true
          }
        }

        // Se for muito longo, provavelmente não é apenas um nome de arquivo
        if (mensagem.body.split('\n').length > 1) {
          return false
        }

        // Se tiver emojis comuns de mensagens (não de nomes de arquivo), provavelmente é mensagem
        if (/(📱|💬|🗨️|📢|📣|📊|🎉|🎊|🎯|🏆|🔔|⚡|💥|👉|👆|👇|👈|⭐|🌟|💫)/u.test(mensagem.body)) {
          return false
        }

        return false
      } catch (error) {
        return false
      }
    },
    async checkTicketIdStatus () {
      if (!this.ticketId) {
        this.protocolos = []
        return
      }
      const numero = parseInt(this.ticketId, 10)
      if (isNaN(numero) || numero <= 0) {
        this.protocolos = []
        return
      }
      try {
        await this.carregarProtocolos()
      } catch (error) {
        this.protocolos = []
        if (this.ticketIdChecks < 5) {
          this.ticketIdChecks++
          setTimeout(() => {
            this.checkTicketIdStatus()
          }, 1000)
        } else {
          console.error('❌ ERRO - checkTicketIdStatus() - Número máximo de tentativas atingido')
        }
      }
    },
    openContactModal (contact) {
      this.currentContact = contact
      this.modalContato = true
    },
    closeModal () {
      this.modalContato = false
    },
    saveContact (contact) {
      // Removido log de contato salvo
    },
    async salvarMensagem () {
      try {
        const updatedMessage = await EditarMensagem({
          id: this.mensagemAtual.id,
          messageId: this.mensagemAtual.messageId,
          body: this.mensagemAtual.body
        })
        // Removido log de mensagem editada
        this.showModaledit = false
        this.atualizarMensagem(updatedMessage)
      } catch (error) {
        this.$notificarErro('Não foi possível editar a mensagem')
      }
    },
    atualizarMensagem (updatedMessage) {
      const index = this.mensagens.findIndex(mensagem => mensagem.id === updatedMessage.id)
      if (index !== -1) {
        this.mensagens.splice(index, 1, updatedMessage)
      }
    },
    AbrirmodaleditarMensagem (mensagem) {
      this.mensagemAtual = mensagem
      this.showModaledit = true
    },
    verificarEncaminharMensagem (mensagem) {
      const mensagens = [...this.mensagensParaEncaminhar]
      const msgIdx = mensagens.findIndex(m => m.id === mensagem.id)
      if (msgIdx !== -1) {
        mensagens.splice(msgIdx, 1)
      } else {
        if (this.mensagensParaEncaminhar.length > 9) {
          this.$notificarErro('Permitido no máximo 10 mensagens.')
          return
        }
        mensagens.push(mensagem)
      }
      this.$refs[`box-chat-message-${mensagem.id}`][0].value = !this.$refs[`box-chat-message-${mensagem.id}`][0].value
      this.$emit('update:mensagensParaEncaminhar', mensagens)
    },
    marcarMensagensParaEncaminhar (mensagem) {
      this.$emit('update:mensagensParaEncaminhar', [])
      this.$emit('update:ativarMultiEncaminhamento', !this.ativarMultiEncaminhamento)
    },
    isGroupLabel (mensagem) {
      try {
        if (!this.ticketFocado) {
          return ''
        }
        const resultado = this.ticketFocado.isGroup ? mensagem.contact?.name || '' : ''
        return resultado
      } catch (error) {
        console.error('❌ ERRO - isGroupLabel() - Erro ao verificar grupo:', error)
        return ''
      }
    },
    returnCardContato (str) {
      return Base64.encode(str)
    },
    isDesactivatDelete (msg) {
      return false
    },
    async carregarProtocolos () {
      if (this.carregandoProtocolos) {
        return
      }

      if (!this.ticketId) {
        this.protocolos = []
        return
      }

      const numeroId = parseInt(this.ticketId.toString(), 10)
      if (isNaN(numeroId) || numeroId <= 0) {
        this.protocolos = []
        return
      }

      this.carregandoProtocolos = true
      try {
        const response = await ListarProtocolos(numeroId)

        if (!response?.data) {
          throw new Error('Resposta inválida da API')
        }
        this.protocolos = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Não foi possível carregar os protocolos',
          position: 'top',
          timeout: 3000
        })
        this.protocolos = []
      } finally {
        this.carregandoProtocolos = false
      }
    },
    obterTextoProtocolo (protocolo) {
      if (!protocolo) return ''
      const dataAbertura = this.formatarData(protocolo.createdAt, 'dd/MM/yy')
      const horaAbertura = this.formatarData(protocolo.createdAt, 'HH.mm')
      const statusIcon = protocolo.status === 'ABER' ? '🟢' : '🔴'
      const tipoProtocolo = protocolo.status === 'ABER' ? 'abertura' : 'fechamento'
      const numeroProtocolo = protocolo.protocolNumber.toString().replace(/[()]/g, '')
      return `${statusIcon} (Protocolo ${numeroProtocolo}) - (${tipoProtocolo} ${dataAbertura} as ${horaAbertura} Por ${protocolo.userName || 'Desconhecido'})`
    },
    async buscarImageCors (imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers['content-type'] })
        )
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro('Ocorreu um erro', error)
      }
      this.loading = false
    },
    citarMensagem (mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      this.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    encaminharMensagem (mensagem) {
      this.$emit('mensagem-chat:encaminhar-mensagem', mensagem)
    },
    async deletarMensagem (mensagem) {
      const msgTime = new Date(mensagem.createdAt || mensagem.timestamp)
      const horasPassadas = (Date.now() - msgTime.getTime()) / (1000 * 60 * 60)
      if (horasPassadas > 48) {
        this.$q.notify({
          type: 'warning',
          message: 'Não é possível apagar mensagens com mais de 48 horas do envio',
          position: 'top',
          timeout: 3000,
          color: 'warning'
        })
        return
      }

      if (mensagem.isSystem) {
        this.$q.notify({
          type: 'warning',
          message: 'Não é possível apagar mensagens do sistema',
          position: 'top',
          timeout: 3000,
          color: 'warning'
        })
        return
      }

      if (this.isDesactivatDelete(mensagem)) {
        this.$q.notify({
          type: 'warning',
          message: 'Não foi possível apagar mensagem com mais de 5min do envio',
          position: 'top',
          timeout: 3000,
          color: 'warning'
        })
        return
      }

      const data = { ...mensagem }
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar a mensagem?',
        message: 'Mensagens antigas não serão apagadas no cliente.',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarMensagem(data)
          .then(() => {
            this.loading = false
            mensagem.isDeleted = true
            this.$q.notify({
              type: 'positive',
              message: 'Mensagem apagada com sucesso',
              position: 'top',
              timeout: 2000
            })
          })
          .catch(error => {
            this.loading = false
            let mensagemErro = 'Não foi possível apagar a mensagem'
            if (error.response?.data?.error === 'ERR_DELETE_SYSTEM_MSG' ||
                error.response?.data?.message?.includes('48 hours')) {
              mensagemErro = 'Não é possível apagar mensagens com mais de 48 horas do envio'
            }
            this.$q.notify({
              type: 'warning',
              message: mensagemErro,
              position: 'top',
              timeout: 3000,
              color: 'warning'
            })
          })
      })
    },
    focarMensagem (mensagem) {
      const id = `chat-message-${mensagem.id}`
      this.identificarMensagem = id
      this.$nextTick(() => {
        const elem = document.getElementById(id)
        elem.scrollIntoView()
      })
      setTimeout(() => {
        this.identificarMensagem = null
      }, 5000)
    },
    getVotePercentage (option, options) {
      const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0)
      if (totalVotes === 0) return 0
      return Math.round((option.votes || 0) * 100 / totalVotes)
    },
    totalVotes () {
      if (!this.mensagem.pollData?.options) return 0
      return this.mensagem.pollData.options.reduce((sum, opt) => sum + (opt.votes || 0), 0)
    },
    mostrarDivisorProtocolo (mensagem, index) {
      if (!this.protocolos?.length) {
        return false
      }

      try {
        const dataMensagem = new Date(mensagem.createdAt)
        if (isNaN(dataMensagem.getTime())) {
          return false
        }

        if (index === 0) {
          return true
        }

        const mensagemAnterior = this.mensagens[index - 1]
        if (!mensagemAnterior) {
          return false
        }

        const dataAnterior = new Date(mensagemAnterior.createdAt)
        if (isNaN(dataAnterior.getTime())) {
          return false
        }

        const protocolosEntreMsg = this.protocolos.filter(p => {
          const dataProtocolo = new Date(p.createdAt)
          return dataProtocolo >= dataAnterior && dataProtocolo <= dataMensagem
        })

        if (protocolosEntreMsg.length > 0) {
          const protocolosAnteriores = new Set(
            this.mensagens.slice(0, index)
              .map(m => {
                const data = new Date(m.createdAt)
                const protocolo = this.getProtocoloMensagem(data)
                return protocolo ? `${protocolo.protocolNumber}-${protocolo.status}` : null
              })
              .filter(Boolean)
          )

          const temNovoProtocolo = protocolosEntreMsg.some(p => {
            const chaveProtocolo = `${p.protocolNumber}-${p.status}`
            return !protocolosAnteriores.has(chaveProtocolo)
          })

          if (temNovoProtocolo) {
            return true
          }
        }

        const protocoloAtual = this.getProtocoloMensagem(dataMensagem)
        const protocoloAnterior = this.getProtocoloMensagem(dataAnterior)

        if (!protocoloAtual || !protocoloAnterior) return false

        if (protocoloAtual.protocolNumber !== protocoloAnterior.protocolNumber ||
            protocoloAtual.status !== protocoloAnterior.status) {
          return true
        }

        return false
      } catch (error) {
        return false
      }
    },
    getProtocoloMensagem (msgDate) {
      if (!this.protocolos?.length) {
        return null
      }

      try {
        const dataMsg = new Date(msgDate)
        if (isNaN(dataMsg.getTime())) {
          return null
        }

        const protocolosOrdenados = [...this.protocolos].sort((a, b) => {
          const dataA = new Date(a.createdAt)
          const dataB = new Date(b.createdAt)
          return dataB.getTime() - dataA.getTime()
        })

        const protocoloMaisProximo = protocolosOrdenados.reduce((mais_proximo, atual) => {
          const dataAtual = new Date(atual.createdAt)
          const dataMaisProximo = mais_proximo ? new Date(mais_proximo.createdAt) : null

          if (!dataMaisProximo) return atual

          const difAtual = Math.abs(dataMsg.getTime() - dataAtual.getTime())
          const difMaisProximo = Math.abs(dataMsg.getTime() - dataMaisProximo.getTime())

          return difAtual < difMaisProximo ? atual : mais_proximo
        }, null)

        return protocoloMaisProximo
      } catch (error) {
        return null
      }
    },
    isCodeFile (url) {
      if (!url) return false
      const codeExtensions = [
        'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'php', 'rb', 'go', 'rs',
        'css', 'scss', 'json', 'yaml', 'yml', 'md', 'sql', 'sh', 'bash',
        'vue', 'html', 'xml', 'c', 'cpp', 'cs', 'swift', 'kt', 'r'
      ]
      try {
        const extension = url.split('.').pop().toLowerCase()
        return codeExtensions.includes(extension)
      } catch (error) {
        return false
      }
    },
    getFileExtension (filename) {
      if (!filename) return 'plaintext'
      try {
        return filename.split('.').pop().toLowerCase()
      } catch (error) {
        return 'plaintext'
      }
    }
  },
  created () {
    if (this.ticketIdValido) {
      this.$nextTick(() => {
        this.checkTicketIdStatus()
      })
    }
  },
  async mounted () {
    if (this.ticketIdValido) {
      await this.carregarProtocolos()
    }
    this.scrollToBottom()
  }
}
</script>

<style lang="scss">
.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.poll-container {
  padding: 12px;
  border-radius: 8px;
  background: #202C33;
  min-width: 250px;
  color: white;
}

.poll-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.poll-title {
  font-weight: 500;
  font-size: 1em;
  color: white;
}

.poll-subtitle {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0;
}

.poll-option {
  position: relative;
  padding: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.poll-option-content {
  position: relative;
  z-index: 1;
}

.poll-option-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.poll-option-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(0, 150, 136, 0.2);
  transition: width 0.3s ease;
  z-index: 0;
  border-radius: 4px;
}

.poll-option-text {
  font-weight: 500;
  color: white;
}

.poll-option-votes {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 8px;
}

.poll-footer {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;

  :deep(.q-btn) {
    min-height: 32px;
    font-size: 0.9em;
  }
}

.poll-no-options {
  text-align: center;
  padding: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.poll-total-votes {
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: 0.9;
  margin: 25px 0;
  width: 100%;

  &:before {
    content: '';
    background: linear-gradient(to right, transparent, var(--protocolo-cor, #818078), transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    padding: 8px 15px;
    line-height: 1.5em;
    color: var(--protocolo-texto, #818078);
    background: var(--protocolo-fundo, #fcfcfa);
    font-weight: 500;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }

  &.protocolo-aberto {
    --protocolo-cor: #4CAF50;
    --protocolo-texto: #1B5E20;
    --protocolo-fundo: #E8F5E9;
  }

  &.protocolo-fechado {
    --protocolo-cor: #F44336;
    --protocolo-texto: #B71C1C;
    --protocolo-fundo: #FFEBEE;
  }
}

.body--dark {
  .hr-text {
    color: white;

    &:after {
      color: var(--protocolo-texto, #fcfcfa);
      background: var(--protocolo-fundo, #1d1d1d);
      border-color: rgba(255, 255, 255, 0.1);
    }

    &:before {
      background: linear-gradient(to right, transparent, var(--protocolo-cor, #fcfcfa), transparent);
    }

    &.protocolo-aberto {
      --protocolo-cor: #81C784;
      --protocolo-texto: #C8E6C9;
      --protocolo-fundo: #1B5E20;
    }

    &.protocolo-fechado {
      --protocolo-cor: #E57373;
      --protocolo-texto: #FFCDD2;
      --protocolo-fundo: #B71C1C;
    }
  }
}

.media-container {
  width: 100%;
  min-width: 200px;
  max-width: 600px;
  overflow: visible;
  margin: 8px 0;
  border-radius: 8px;
  background: #1e1e1e;

  :deep(.media-viewer) {
    width: 100%;
    min-width: 200px;
    max-width: 600px;
    border-radius: 8px;
    overflow: hidden;

    img, video {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .document-preview {
      padding: 16px;
      background: #1e1e1e;
      border-radius: 8px;

      .document-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #abb2bf;

        .document-name {
          font-size: 0.9em;
          font-weight: 500;
          word-break: break-all;
        }
      }
    }
  }
}

@media (max-width: 500px) {
  .media-container {
    min-width: 200px;
    max-width: 100%;

    :deep(.media-viewer) {
      min-width: 200px;
      max-width: 100%;
    }
  }
}

.document-stamp-actions {
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  .q-btn {
    min-height: 20px;
    padding: 0 4px;
  }
}
</style>
