<template>
  <div class="media-preview">
    <!-- Imagem -->
    <div
      v-if="isImage"
      class="media-container"
    >
      <q-img
        :src="mediaUrl"
        spinner-color="primary"
        class="media-content"
        fit="contain"
      />
    </div>

    <!-- Video -->
    <div
      v-else-if="isVideo"
      class="media-container"
    >
      <video
        controls
        class="media-content"
        :src="mediaUrl"
      />
    </div>

    <!-- Audio -->
    <div
      v-else-if="isAudio"
      class="media-container"
    >
      <div class="audio-preview">
        <q-icon
          name="music_note"
          size="48px"
          color="primary"
        />
        <audio
          controls
          class="media-content q-mt-md"
          :src="mediaUrl"
        />
      </div>
    </div>

    <!-- Documento -->
    <div
      v-else
      class="media-container document-preview"
    >
      <div class="document-content">
        <q-icon
          :name="documentIcon"
          size="48px"
          color="primary"
        />
        <div class="document-info q-mt-sm">
          <div class="text-subtitle2">{{ fileName }}</div>
          <div class="text-caption">{{ fileSize }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MediaPreview',
  props: {
    file: {
      type: [File, Blob],
      required: true
    }
  },
  data () {
    return {
      mediaUrl: '',
      fileName: '',
      fileSize: ''
    }
  },
  computed: {
    isImage () {
      return this.file.type.startsWith('image/')
    },
    isVideo () {
      return this.file.type.startsWith('video/')
    },
    isAudio () {
      return this.file.type.startsWith('audio/')
    },
    documentIcon () {
      const fileType = this.file.type
      if (fileType.includes('pdf')) return 'mdi-file-pdf'
      if (fileType.includes('word') || fileType.includes('doc')) {
        return 'mdi-file-word'
      }
      if (fileType.includes('excel') || fileType.includes('sheet')) {
        return 'mdi-file-excel'
      }
      if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        return 'mdi-file-powerpoint'
      }
      return 'mdi-file-document-outline'
    }
  },
  methods: {
    formatFileSize (bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  },
  mounted () {
    this.mediaUrl = URL.createObjectURL(this.file)
    this.fileName = this.file.name || 'Arquivo'
    this.fileSize = this.formatFileSize(this.file.size)
  },
  beforeUnmount () {
    URL.revokeObjectURL(this.mediaUrl)
  }
}
</script>

<style lang="sass" scoped>
.media-preview
  width: 100%
  height: 100%
  position: relative
  overflow: hidden

.media-container
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  background: #ffffff
  position: relative

.media-content
  flex: 1
  width: 100%
  height: 100%
  object-fit: contain
  max-height: 600px

.file-info
  width: 100%
  .text-subtitle2
    font-size: 12px
    line-height: 1.2
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  .text-caption
    font-size: 11px
    opacity: 0.8

.audio-preview
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  padding: 16px
  height: 100%
  background: #f0f2f5

.document-preview
  .document-content
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    padding: 16px
    height: 100%
    background: #f0f2f5

.document-info
  text-align: center
  margin-top: 8px
  .text-subtitle2
    font-size: 12px
    line-height: 1.2
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    max-width: 200px
  .text-caption
    font-size: 11px
    opacity: 0.8

.bg-dark-dimmed
  background: rgba(0, 0, 0, 0.6)
</style>
