<template>
  <q-dialog
    :model-value="modalMensagemRapida"
    @hide="fecharModal"
    @show="abrirModal"
    @keyup.esc="fecharModal"
  >
    <q-card
      :style="$q.screen.width < 500 ? 'width: 95vw' : 'min-width: 500px; max-width: 700px'"
      class="q-pa-lg"
    >
      <div class="text-h6">
        {{ mensagemRapida.id ? 'Editar' : 'Criar' }} Mensagem Rápida
        {{ mensagemRapida.id ? `(ID: ${mensagemRapida.id})` : '' }}
      </div>
      <q-card-section class="q-pa-none">
        <div class="row q-my-sx">
          <div class="col flex justify-center">
            <div class="column items-center">
              <q-input
                style="width: 300px"
                outlined
                rounded
                dense
                v-model="key"
                v-bind="keyProps"
                label="Chave"
                :error="!!errors.key"
                :error-message="errors.key"
              />
              <p style="font-size: 14px; margin-top: 3px; text-align: center">
                chave é o atalho para pesquisa da mensagem.
              </p>
            </div>
          </div>
        </div>

        <!-- Ícones para Emojis e Variáveis -->
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <!-- Emoji Icon -->
            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-emoticon-happy-outline"
              />
              <q-tooltip> Emoji </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <EmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  labelSearch="Localizar..."
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>

            <!-- Variáveis Icon -->
            <q-btn
              round
              flat
              class="q-ml-sm"
            >
              <q-icon
                size="2em"
                name="mdi-code-braces"
              />
              <q-tooltip> Variáveis </q-tooltip>
              <q-menu
                anchor="top right"
                self="bottom middle"
                :offset="[5, 40]"
              >
                <q-list padding>
                  <q-item
                    v-for="variavel in variaveis"
                    :key="variavel.value"
                    clickable
                    @click="inserirVariavel(variavel.value)"
                  >
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Textarea for Message -->
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 15vh; max-height: 25vh"
              class="q-pa-sm bg-white full-width rounded-all"
              placeholder="Digite a mensagem"
              autogrow
              dense
              outlined
              v-model="message"
              v-bind="messageProps"
            />
          </div>
        </div>

        <!-- Área de Preview -->
        <div
          v-if="mensagemRapida.medias && mensagemRapida.medias.length > 0"
          class="media-preview-container q-mb-sm"
        >
          <!-- Previews dos Arquivos -->
          <div
            v-for="(media, index) in mensagemRapida.medias"
            :key="index"
            class="media-preview-item"
          >
            <q-card class="media-preview-card">
              <q-img
                v-if="isImage(media)"
                :src="getMediaUrl(media)"
                class="media-preview-image cursor-pointer"
                fit="contain"
                @click="visualizarImagem(media)"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">Erro ao carregar imagem</div>
                </template>
              </q-img>
              <video
                v-else-if="isVideo(media)"
                class="media-preview-video"
                controls
                :src="getMediaUrl(media)"
                :type="getMediaType(media)"
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
              <div
                v-else
                class="file-preview-container flex flex-center column"
              >
                <q-icon
                  :name="getFileIcon(media)"
                  size="64px"
                  color="primary"
                />
                <div class="text-subtitle2 q-mt-sm text-center text-truncate">
                  {{ getMediaFileName(media) }}
                </div>
              </div>
              <q-card-actions
                align="center"
                class="q-pa-sm bg-grey-2"
              >
                <q-btn
                  flat
                  dense
                  round
                  icon="remove_red_eye"
                  color="primary"
                  @click="abrirMedia(media)"
                >
                  <q-tooltip>Visualizar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click="confirmarExclusao(media, index)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="onFileInputChange"
          multiple
          accept="apk/*,image/*,video/*,audio/*,application/pdf"
        />
      </q-card-section>

      <!-- Botões de ação -->
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          round
          color="primary"
          icon="attach_file"
          class="q-mr-md"
          @click="fileInput.click()"
        >
          <q-tooltip>Anexar Arquivo</q-tooltip>
        </q-btn>
        <q-btn
          rounded
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          rounded
          label="Salvar"
          color="positive"
          @click="handleMensagemRapida"
        />
      </q-card-actions>
    </q-card>

    <!-- Modal de confirmação para exclusão -->
    <q-dialog
      v-model="confirmDialog"
      persistent
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmação</div>
          <p>Tem certeza de que deseja excluir esta mídia?</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            @click="excluirMedia(mediaToDelete, indexToDelete)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de visualização da imagem -->
    <q-dialog
      v-model="showImageModal"
      :maximized="false"
      transition-show="fade"
      transition-hide="fade"
      @keyup.esc="showImageModal = false"
    >
      <q-card
        class="bg-dark text-white"
        style="min-width: 40vw; min-height: 40vh; max-width: 99vw; max-height: 99vh"
      >
        <q-bar class="bg-dark">
          <q-space />
          <q-btn
            dense
            flat
            icon="close"
            v-close-popup
          >
            <q-tooltip>Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section
          class="flex flex-center"
          style="padding: 0"
        >
          <q-img
            :src="selectedImageUrl"
            fit="scale-down"
            style="min-width: 40vw; min-height: calc(40vh - 50px); max-width: 99vw; max-height: calc(99vh - 50px)"
            @load="onImageLoad"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { z } from 'zod'

const props = defineProps({
  modalMensagemRapida: {
    type: Boolean,
    default: false
  },
  mensagemRapidaEmEdicao: {
    type: Object,
    default: () => ({ id: null, key: '', message: '', medias: [] })
  }
})

const emit = defineEmits([
  'update:modalMensagemRapida',
  'update:mensagemRapidaEmEdicao',
  'mensagemRapida:criada',
  'mensagemRapida:editada'
])

const $q = useQuasar()
const mensagemRapidaStore = useMensagemRapidaStore()
const { criarMensagemRapida, alterarMensagemRapida, deletarImagemMensagemRapida } = mensagemRapidaStore

const loading = ref(false)
const confirmDialog = ref(false)
const mediaToDelete = ref(null)
const indexToDelete = ref(null)
const showImageModal = ref(false)
const selectedImageUrl = ref('')
const fileInput = ref(null)
const inputEnvioMensagem = ref(null)

const validationSchema = toTypedSchema(
  z.object({
    key: z.string().min(1, 'A chave é obrigatória'),
    message: z.string().optional(),
    medias: z.array(z.any()).optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    key: '',
    message: '',
    medias: []
  }
})

const [key, keyProps] = defineField('key')
const [message, messageProps] = defineField('message')

const mensagemRapida = reactive({
  id: null,
  medias: []
})

const variaveis = [
  { label: 'Nome', value: '{{name}}' },
  { label: 'Saudação', value: '{{greeting}}' },
  { label: 'Protocolo', value: '{{protocol}}' }
]

const onInsertSelectEmoji = emoji => {
  const tArea = inputEnvioMensagem.value
  if (!tArea || !emoji.data) return

  const startPos = tArea.selectionStart
  const endPos = tArea.selectionEnd
  const tmpStr = message.value || ''

  const newMessage = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos)
  setValues({ message: newMessage })

  nextTick(() => {
    tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
    tArea.focus()
  })
}

const inserirVariavel = variavel => {
  setValues({ message: (message.value || '') + ' ' + variavel })
}

const onFileAdded = files => {
  mensagemRapida.medias = [...mensagemRapida.medias, ...files]
}

const onFileInputChange = event => {
  const files = Array.from(event.target.files)
  onFileAdded(files)
  event.target.value = null
}

const getMediaUrl = media => {
  if (media instanceof File) {
    return URL.createObjectURL(media)
  }
  return media
}

const isImage = media => {
  if (media instanceof File) {
    return media.type.startsWith('image/')
  }
  return typeof media === 'string' && (media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.png'))
}

const isVideo = media => {
  if (media instanceof File) {
    return media.type.startsWith('video/')
  }
  return typeof media === 'string' && (media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.ogg'))
}

const getMediaType = media => {
  if (media instanceof File) return media.type
  if (typeof media !== 'string') return ''
  if (media.endsWith('.mp4')) return 'video/mp4'
  if (media.endsWith('.webm')) return 'video/webm'
  if (media.endsWith('.ogg')) return 'video/ogg'
  return ''
}

const getFileIcon = media => {
  const type = media instanceof File ? media.type : typeof media === 'string' ? media.toLowerCase() : ''
  if (type.includes('pdf')) return 'picture_as_pdf'
  if (type.includes('audio')) return 'audio_file'
  if (type.includes('video')) return 'video_file'
  if (type.includes('image')) return 'image'
  if (type.includes('apk')) return 'android'
  return 'insert_drive_file'
}

const getMediaFileName = media => {
  if (media instanceof File) return media.name
  return typeof media === 'string' ? media.split('/').pop() : ''
}

const abrirMedia = media => {
  const url = getMediaUrl(media)
  window.open(url, '_blank')
}

const confirmarExclusao = (media, index) => {
  mediaToDelete.value = media
  indexToDelete.value = index
  confirmDialog.value = true
}

const excluirMedia = async (media, index) => {
  try {
    confirmDialog.value = false
    if (mensagemRapida.id && typeof media === 'string') {
      await deletarImagemMensagemRapida(mensagemRapida.id, media)
    }
    mensagemRapida.medias.splice(index, 1)
    $q.notify({ type: 'positive', message: 'Mídia excluída com sucesso!' })
  } catch (error) {
    console.error('Erro ao excluir a imagem:', error)
  }
}

const resetarModal = () => {
  resetForm()
  mensagemRapida.id = null
  mensagemRapida.medias = []
  setValues({ key: '', message: '' })
}

const fecharModal = () => {
  resetarModal()
  emit('update:mensagemRapidaEmEdicao', { id: null })
  emit('update:modalMensagemRapida', false)
}

const abrirModal = () => {
  if (props.mensagemRapidaEmEdicao.id) {
    mensagemRapida.id = props.mensagemRapidaEmEdicao.id
    mensagemRapida.medias = props.mensagemRapidaEmEdicao.medias || []
    setValues({
      key: props.mensagemRapidaEmEdicao.key,
      message: props.mensagemRapidaEmEdicao.message || ''
    })
  } else {
    resetarModal()
  }
}

const handleMensagemRapida = handleSubmit(async values => {
  const formData = new FormData()
  formData.append('key', values.key)
  formData.append('message', values.message || '')

  if (mensagemRapida.medias) {
    mensagemRapida.medias.forEach(file => {
      formData.append('medias', file)
    })
  }

  loading.value = true
  try {
    if (mensagemRapida.id) {
      const data = await alterarMensagemRapida(mensagemRapida.id, formData)
      emit('mensagemRapida:editada', { ...data })
      $q.notify({
        type: 'info',
        message: 'Mensagem Rápida editada!',
        position: 'top'
      })
    } else {
      const data = await criarMensagemRapida(formData)
      emit('mensagemRapida:criada', data)
      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida criada!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

const visualizarImagem = media => {
  selectedImageUrl.value = getMediaUrl(media)
  showImageModal.value = true
}

const onImageLoad = () => {
  // Logic for resizing if needed, but CSS handles containment mostly.
  // Keeping simplified for now as per original logic if really needed, but it looked mostly DOM manipulation.
  // Will rely on q-img component props for now.
}

watch(showImageModal, newValue => {
  if (!newValue) {
    const allVideos = document.querySelectorAll('.media-preview-video, .video-preview')
    allVideos.forEach(video => {
      if (video && !video.paused) {
        video.pause()
      }
    })
  }
})
</script>

<style scoped>
/* Estilos Comuns */
.common-background {
  background: #f5f5f5;
}

.common-flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Container Principal */
.media-preview-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  gap: 16px;
  padding: 8px;
  min-height: 100px; /* Reduced min-height */
  max-height: 600px;
  width: 100%; /* Ocupa toda a largura disponível */
  margin: 0 auto;
}

/* Itens de Pré-visualização */
.media-preview-item,
.file-preview-container {
  position: relative;
  width: 150px; /* Fixed width for better grid */
  height: 150px; /* Fixed height for squares */
  display: flex;
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

/* Cartão de Pré-visualização */
.media-preview-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.media-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgb(255, 255, 255);
  border-color: var(--q-primary);
}

/* Imagem e Vídeo */
.media-preview-image,
.media-preview-video,
.video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Mantém a proporção da mídia */
  display: flex;
  justify-content: center;
  align-items: center;
  background: inherit;
}

/* Vídeo */
.media-preview-video {
  background: #000; /* Fundo preto para vídeos */
}

/* Container de Arquivo */
.file-preview-container {
  padding: 10px;
  flex-direction: column;
}

/* Ícone no Preview de Arquivo */
.file-preview-container .q-icon {
  font-size: 40px !important;
}

/* Texto Truncado */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  margin: 0 auto;
  font-size: 0.8em;
  text-align: center;
}

/* Ações do Cartão */
.q-card-actions {
  position: absolute; /* Overlay actions */
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  opacity: 0; /* Hide by default */
}

.media-preview-card:hover .q-card-actions {
  opacity: 1; /* Show on hover */
}

/* Botões de ação no hover */
.q-card-actions .q-btn {
  transform: scale(0.9);
}

.q-card-actions .q-btn:hover {
  transform: scale(1.1);
}
</style>
