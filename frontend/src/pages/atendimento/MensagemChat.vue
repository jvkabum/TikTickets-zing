<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-for="(mensagem, index) in mensagens" :key="index">
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
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
          <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
          <div
            style="min-width: 100px; max-width: 350px;"
            :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''"
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
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>
            <q-btn
              v-if=" !mensagem.isDeleted && isShowOptions "
              class="absolute-top-right mostar-btn-opcoes-chat"
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
                    :disable=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) "
                    clickable
                    @click=" citarMensagem(mensagem) "
                  >
                    <q-item-section>Responder</q-item-section>
                    <q-tooltip v-if=" !['whatsapp', 'telegram'].includes(ticketFocado.channel) ">
                      Disponível apenas para WhatsApp e Telegram
                    </q-tooltip>
                  </q-item>
                  <q-item
                    clickable
                    @click=" encaminharMensagem(mensagem) "
                  >
                    <q-item-section>Encaminhar</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click=" marcarMensagensParaEncaminhar(mensagem) "
                  >
                    <q-item-section>Marcar (encaminhar várias)</q-item-section>
                  </q-item>
                  <q-item
                    @click=" AbrirmodaleditarMensagem(mensagem) "
                    clickable
                    v-if=" mensagem.fromMe  && mensagem.mediaType === 'chat'"
                    :disable="ticketFocado.channel === 'messenger'"
                  >
                    <q-item-section>
                      <q-item-label>Editar Mensagem</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    @click=" deletarMensagem(mensagem) "
                    clickable
                    v-if=" mensagem.fromMe "
                    :disable=" isDesactivatDelete(mensagem) || ticketFocado.channel === 'messenger' "
                  >
                    <q-item-section>
                      <q-item-label>Deletar</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon
              v-if=" mensagem.fromMe "
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name=" ackIcons[mensagem.ack] "
              size="1.2em"
              :color=" mensagem.ack >= 3 ? 'blue-12' : '' "
            />
            <template v-if=" mensagem.mediaType === 'audio' ">
              <div style="width: 330px; heigth: 300px">
                <audio
                  class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="nodownload volume novolume"
                >
                  <source :src="mensagem.mediaUrl" type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if=" mensagem.mediaType === 'vcard' ">
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
                @click=" urlMedia = mensagem.mediaUrl; abrirModalImagem = false "
                src="../../assets/localizacao.png"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
              </template>
            <template v-if=" mensagem.mediaType === 'image' ">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                @click=" urlMedia = mensagem.mediaUrl; abrirModalImagem = true "
                :src=" mensagem.mediaUrl "
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer;"
              />
              <VueEasyLightbox
                moveDisabled
                :visible=" abrirModalImagem "
                :imgs=" urlMedia "
                :index=" mensagem.ticketId || 1 "
                @hide=" abrirModalImagem = false "
              />
            </template>
            <template v-if=" mensagem.mediaType === 'video' ">
              <video
                :src=" mensagem.mediaUrl "
                controls
                class="q-mt-md"
                style="objectFit: cover;
                  width: 330px;
                  height: 150px;
                  borderTopLeftRadius: 8px;
                  borderTopRightRadius: 8px;
                  borderBottomLeftRadius: 8px;
                  borderBottomRightRadius: 8px;
                "
              >
              </video>
            </template>
            <template v-if=" !['audio', 'vcard', 'image', 'video'].includes(mensagem.mediaType) && mensagem.mediaUrl ">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <iframe
                  v-if=" isPDF(mensagem.mediaUrl) "
                  frameBorder="0"
                  scrolling="no"
                  style="
                    width: 330px;
                    height: 150px;
                    overflow-y: hidden;
                    -ms-overflow-y: hidden;
                  "
                  class="no-scroll hide-scrollbar"
                  :src=" mensagem.mediaUrl "
                  id="frame-pdf"
                >
                  Faça download do PDF
                  <!-- alt : <a href="mensagem.mediaUrl"></a> -->
                </iframe>
                <q-btn
                  type="a"
                  :color=" $q.dark.isActive ? '' : 'grey-3' "
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded  text-grey-9 ellipsis"
                  download
                  :target=" isPDF(mensagem.mediaUrl) ? '_blank' : '' "
                  :href=" mensagem.mediaUrl "
                >
                  <q-tooltip
                    v-if=" mensagem.mediaUrl "
                    content-class="text-bold"
                  >
                    Baixar: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs ">
                    <div
                      class="ellipsis col-grow q-pr-sm"
                      style="max-width: 290px"
                    >
                      {{ farmatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
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
              v-if=" !['vcard', 'application', 'audio', 'poll_creation'].includes(mensagem.mediaType) "
              :class=" { 'q-mt-sm': mensagem.mediaType !== 'chat' } "
              class="q-message-container row items-end no-wrap"
            >
              <div v-html=" farmatarMensagemWhatsapp(mensagem.body) ">
              </div>
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
import mixinCommon from './mixinCommon'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida'
import ContatoCard from './ContatoCard.vue'
import ContatoModal from './ContatoModal.vue'
import { DeletarMensagem, EditarMensagem } from 'src/service/tickets'
import { Base64 } from 'js-base64'
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
      default: () => { }
    }
  },
  data () {
    return {
      modalContato: false,
      currentContact: {},
      mensagemAtual: { body: '' },
      showModaledit: false,
      abrirModalImagem: false,
      urlMedia: '',
      identificarMensagem: null,
      selectedPollOption: null,
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
    VueEasyLightbox,
    MensagemRespondida,
    ContatoCard,
    ContatoModal
  },
  methods: {
    openContactModal (contact) {
      this.currentContact = contact
      this.modalContato = true
    },
    closeModal () {
      this.modalContato = false
    },
    saveContact (contact) {
      console.log('Contato salvo:', contact)
      // Aqui você pode adicionar a lógica para salvar o contato
    },
    async salvarMensagem () {
      try {
        const updatedMessage = await EditarMensagem({
          id: this.mensagemAtual.id,
          messageId: this.mensagemAtual.messageId,
          body: this.mensagemAtual.body
        })
        console.log('Mensagem editada com sucesso')
        this.showModaledit = false
        this.atualizarMensagem(updatedMessage)
      } catch (error) {
        console.error('Erro ao editar a mensagem', error.message)
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
      // this.verificarEncaminharMensagem(mensagem)
    },
    isPDF (url) {
      if (!url) return false
      const split = url.split('.')
      const ext = split[split.length - 1]
      return ext === 'pdf'
    },
    isGroupLabel (mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    returnCardContato (str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    isDesactivatDelete (msg) {
      return false
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
      // Verifica se a mensagem tem mais de 48 horas
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
            console.error('Erro ao deletar mensagem:', error)
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
    }
  },
  mounted () {
    this.scrollToBottom()
  },
  destroyed () {
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
</style>
