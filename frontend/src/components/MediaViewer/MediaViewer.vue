<template>
  <div class="media-viewer">
    <ImageViewer
      v-if="isImage"
      :src="mediaUrl"
      :alt="mediaName || 'Imagem'"
    />

    <VideoViewer
      v-else-if="isVideo"
      :src="mediaUrl"
    />

    <DocumentViewer
      v-else-if="isDocument"
      :src="mediaUrl"
      :fileName="mediaName"
    />

    <div v-else class="unknown-media">
      <q-icon name="help_outline" size="50px" color="grey-6" />
      <div class="q-mt-sm text-weight-medium">Tipo de mídia não suportado</div>
      <q-btn
        outline
        color="primary"
        icon="download"
        label="Baixar arquivo"
        size="sm"
        class="q-mt-sm"
        :href="mediaUrl"
        target="_blank"
        download
      />
    </div>
  </div>
</template>

<script>
import ImageViewer from './ImageViewer.vue'
import VideoViewer from './VideoViewer.vue'
import DocumentViewer from './DocumentViewer.vue'

export default {
  name: 'MediaViewer',
  components: {
    ImageViewer,
    VideoViewer,
    DocumentViewer
  },
  props: {
    mediaType: {
      type: String,
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    mediaName: {
      type: String,
      default: ''
    }
  },
  computed: {
    isImage () {
      return this.mediaType === 'image'
    },
    isVideo () {
      return this.mediaType === 'video'
    },
    isDocument () {
      return !this.isImage && !this.isVideo && this.mediaUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.media-viewer {
  width: 100%;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  overflow: visible;
}

.unknown-media {
  width: 100%;
  max-width: 700px;
  min-width: 500px;
  padding: 50px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #666;
  margin: 0 auto;
}

.body--dark {
  .unknown-media {
    background-color: #2d2d2d;
    color: #bbb;
  }
}

@media (max-width: 700px) {
  .unknown-media {
    max-width: 100%;
    padding: 30px;
  }
}
</style>
