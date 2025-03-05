<template>
  <div class="video-viewer">
    <div class="video-container" :style="containerStyle">
      <video
        ref="videoElement"
        :src="src"
        controls
        class="viewer-video"
        :class="{ 'vertical-video': isVerticalVideo }"
        preload="metadata"
        :poster="posterUrl"
        @loadedmetadata="onVideoMetadata"
      ></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoViewer',
  props: {
    src: {
      type: String,
      required: true
    },
    posterUrl: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      videoWidth: 0,
      videoHeight: 0
    }
  },
  computed: {
    isVerticalVideo () {
      return this.videoHeight > this.videoWidth
    },
    containerStyle () {
      if (!this.videoWidth || !this.videoHeight) return {}

      const aspect = this.videoWidth / this.videoHeight
      const width = '400px' // Largura fixa
      let height

      if (aspect >= 1) {
        // Vídeo horizontal (landscape)
        height = `${400 / aspect}px` // Altura baseada na proporção
      } else {
        // Vídeo vertical (portrait)
        height = `${Math.min(400 / aspect, 600)}px` // Altura máxima de 700px
      }

      return { width, height }
    }
  },
  methods: {
    onVideoMetadata () {
      const video = this.$refs.videoElement
      if (video) {
        this.videoWidth = video.videoWidth
        this.videoHeight = video.videoHeight
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.video-viewer {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 400px;
  max-height: 600px;
}

.viewer-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;

  &.vertical-video {
    object-fit: cover;
    object-position: center;
    // Corta 5% do topo e base do vídeo para melhor enquadramento
    clip-path: inset(5% 0 5% 0);
  }
}

@media (max-width: 500px) {
  .video-container {
    border-radius: 8px;
  }
}
</style>
