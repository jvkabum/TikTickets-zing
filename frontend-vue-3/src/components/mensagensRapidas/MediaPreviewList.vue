<template>
  <div>
    <!-- Área de Preview -->
    <div
      v-if="medias && medias.length > 0"
      class="media-preview-container q-mb-sm"
    >
      <!-- Previews dos Arquivos -->
      <div
        v-for="(media, index) in medias"
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
            @click="confirmDelete"
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
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  medias: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-media'])

const confirmDialog = ref(false)
const mediaToDelete = ref(null)
const indexToDelete = ref(null)
const showImageModal = ref(false)
const selectedImageUrl = ref('')

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

const visualizarImagem = media => {
  selectedImageUrl.value = getMediaUrl(media)
  showImageModal.value = true
}

const confirmarExclusao = (media, index) => {
  mediaToDelete.value = media
  indexToDelete.value = index
  confirmDialog.value = true
}

const confirmDelete = () => {
  emit('delete-media', { media: mediaToDelete.value, index: indexToDelete.value })
  confirmDialog.value = false
  mediaToDelete.value = null
  indexToDelete.value = null
}

watch(showImageModal, newValue => {
  if (!newValue) {
    const allVideos = document.querySelectorAll('.media-preview-video')
    allVideos.forEach(video => {
      if (video && !video.paused) {
        video.pause()
      }
    })
  }
})
</script>

<style scoped>
/* Container Principal */
.media-preview-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 8px;
  min-height: 100px;
  max-height: 600px;
  width: 100%;
  margin: 0 auto;
}

/* Itens de Pré-visualização */
.media-preview-item,
.file-preview-container {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--q-primary);
}

/* Imagem e Vídeo */
.media-preview-image,
.media-preview-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  background: inherit;
}

/* Vídeo */
.media-preview-video {
  background: #000;
}

/* Container de Arquivo */
.file-preview-container {
  padding: 10px;
  flex-direction: column;
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
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  opacity: 0;
}

.media-preview-card:hover .q-card-actions {
  opacity: 1;
}

.q-card-actions .q-btn {
  transform: scale(0.9);
}

.q-card-actions .q-btn:hover {
  transform: scale(1.1);
}
</style>
