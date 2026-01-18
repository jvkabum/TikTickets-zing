<template>
  <div class="message-media">
    <!-- Imagem -->
    <div
      v-if="type === 'image'"
      class="media-image"
    >
      <q-img
        :src="url"
        :ratio="16/9"
        fit="cover"
        class="rounded-borders cursor-pointer"
        @click="$emit('click')"
      >
        <template v-slot:loading>
          <q-spinner color="primary" />
        </template>
      </q-img>
    </div>

    <!-- Vídeo -->
    <div
      v-else-if="type === 'video'"
      class="media-video"
    >
      <video
        :src="url"
        controls
        class="full-width rounded-borders"
        style="max-height: 300px"
      />
    </div>

    <!-- Áudio -->
    <div
      v-else-if="type === 'audio' || type === 'ptt'"
      class="media-audio row items-center q-pa-sm"
    >
      <q-btn
        round
        :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
        color="primary"
        size="sm"
        @click="togglePlay"
      />
      <div class="col q-mx-sm">
        <q-linear-progress
          :value="progress"
          color="primary"
          track-color="grey-3"
          class="q-my-xs"
        />
        <div class="text-caption text-grey-7">
          {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
        </div>
      </div>
      <audio
        ref="audioRef"
        :src="url"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
      />
    </div>

    <!-- Documento -->
    <div
      v-else-if="type === 'document'"
      class="media-document row items-center q-pa-sm bg-grey-2 rounded-borders"
    >
      <q-icon
        :name="getDocumentIcon(fileName)"
        size="40px"
        color="primary"
      />
      <div class="col q-ml-sm">
        <div class="text-body2 ellipsis">
          {{ fileName || 'Documento' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ formatFileSize(fileSize) }}
        </div>
      </div>
      <q-btn
        round
        flat
        icon="mdi-download"
        color="primary"
        @click="$emit('download')"
      >
        <q-tooltip>Baixar</q-tooltip>
      </q-btn>
    </div>

    <!-- Sticker -->
    <div
      v-else-if="type === 'sticker'"
      class="media-sticker"
    >
      <q-img
        :src="url"
        style="width: 150px; height: 150px"
        fit="contain"
      />
    </div>

    <!-- Localização -->
    <div
      v-else-if="type === 'location'"
      class="media-location q-pa-sm bg-grey-2 rounded-borders"
    >
      <q-icon name="mdi-map-marker" color="red" size="24px" />
      <span class="q-ml-sm">Localização compartilhada</span>
      <q-btn
        flat
        dense
        label="Abrir mapa"
        color="primary"
        class="q-ml-sm"
        @click="$emit('open-map')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (v) => ['image', 'video', 'audio', 'ptt', 'document', 'sticker', 'location'].includes(v)
  },
  url: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
})

defineEmits(['click', 'download', 'open-map'])

const audioRef = ref(null)
const isPlaying = ref(false)
const progress = ref(0)
const currentTime = ref(0)
const duration = ref(0)

const togglePlay = () => {
  if (!audioRef.value) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  progress.value = currentTime.value / duration.value
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
}

const onEnded = () => {
  isPlaying.value = false
  progress.value = 0
  currentTime.value = 0
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const getDocumentIcon = (fileName) => {
  if (!fileName) return 'mdi-file'
  const ext = fileName.split('.').pop()?.toLowerCase()
  const icons = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word',
    docx: 'mdi-file-word',
    xls: 'mdi-file-excel',
    xlsx: 'mdi-file-excel',
    ppt: 'mdi-file-powerpoint',
    pptx: 'mdi-file-powerpoint',
    txt: 'mdi-file-document',
    zip: 'mdi-folder-zip',
    rar: 'mdi-folder-zip'
  }
  return icons[ext] || 'mdi-file'
}
</script>

<style lang="scss" scoped>
.message-media {
  max-width: 300px;
}

.media-image .q-img {
  border-radius: 8px;
  max-height: 300px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
