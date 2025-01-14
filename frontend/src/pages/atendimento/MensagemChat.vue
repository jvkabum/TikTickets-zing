<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <template v-for="(mensagem, index) in mensagens">
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        >
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div
            :key="`ref-${mensagem.createdAt}`"
            ref="lastMessageRef"
            id="lastMessageRef"
            style="float: 'left', background: 'black', clear: 'both'"
          />
        </template>
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
        <div
  style="min-width: 100px; max-width: 350px;"
  :style="{
    color: mensagem.isDeleted || mensagem.edited ? 'rgba(0, 0, 0, 0.36) !important' : '',
    display: hideOriginalMessage ? 'none' : 'block'
  }"
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
            <!-- Mensagem Editada -->
            <div v-if="mensagem.edited" class="edited-message">
              <span class="edited-message-text">
                {{ mensagem.edited }}<br>
              </span>
              <span class="edited-message-container">O conteúdo original foi alterado.</span>
              <q-btn
                flat
                dense
                size="sm"
                color="blue"
                icon="mdi-history"
                class="q-ml-xs"
                title="Ver informações"
              >
                <q-menu anchor="bottom left">
                  <q-item>
                    <q-item-section>
                      <div class="edited-message-previous">
                        Mensagem anterior: <i>{{ mensagem.body }}</i>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-menu>
              </q-btn>
            </div>

            <!-- Mensagem Apagada -->
            <div v-if="mensagem.isDeleted" class="deleted-message">
              <span class="deleted-message-text">Mensagem apagada</span>
              <span class="deleted-message-container">
                {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}
              </span>
              <q-btn
                flat
                dense
                size="sm"
                color="grey"
                icon="mdi-history"
                class="q-ml-xs"
                title="Ver mensagem original"
              >
                <q-menu anchor="bottom left">
                  <q-item>
                    <q-item-section>
                      <div class="deleted-message-previous">
                        Mensagem original:
                        <div class="previous-text">{{ mensagem.body }}</div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-menu>
              </q-btn>
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
            <div
              v-linkified
              v-if=" !['vcard', 'application', 'audio'].includes(mensagem.mediaType) "
              :class=" { 'q-mt-sm': mensagem.mediaType !== 'chat' } "
              class="q-message-container row items-end no-wrap"
            >
              <div v-html=" farmatarMensagemWhatsapp(mensagem.body) ">
              </div>
            </div>
          </div>
        </q-chat-message>
      </template>
    </transition-group>
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
const downloadImageCors = axios.create({
  baseURL: process.env.VUE_URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})
import { DeletarMensagem, EditarMensagem } from 'src/service/tickets'
import { Base64 } from 'js-base64'
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
    // tentativa de ocultar a mensagem original mas nao funcionou
    shouldHideMessage () {
      return !!this.mensagem.body // Retorna true se a mensagem foi editada
    },
    openContactModal (contact) {
      this.currentContact = contact
      this.modalContato = true
    },
    closeModal () {
      this.modalContato = false
    },
    saveContact (contact) {
      console.log('Contato salvo:', contact)
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
    returnCardContato (str) {
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
        this.$notificarErro('Ocorreu um erro!', error)
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
// Estilos existentes
.edited-message {
  display: inline;
  align-items: center;
  gap: 4px;
}

.edited-message-text {
  flex: 1;
  color: #000000;
}

.edited-message-container {
  display: inline;
  font-size: 0.75rem;
  color: #ef4444;
}

.edited-message-previous {
  font-size: 0.75rem;
  color: #3b82f6;

  .previous-text {
    text-decoration: line-through;
    display: block;
    margin-top: 4px;
    font-style: italic;
  }
}

// Novos estilos para mensagens apagadas
.deleted-message {
  display: inline;
  align-items: center;
  gap: 4px;
  font-style: italic;
}

.deleted-message-text {
  flex: 1;
  color: rgba(0, 0, 0, 0.5);
}

.deleted-message-container {
  display: inline;
  font-size: 0.75rem;
  color: #9ca3af;
}

.deleted-message-previous {
  font-size: 0.75rem;
  color: #9ca3af;

  .previous-text {
    text-decoration: line-through;
    display: block;
    margin-top: 4px;
    color: rgba(0, 0, 0, 0.5);
  }
}

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
</style>
