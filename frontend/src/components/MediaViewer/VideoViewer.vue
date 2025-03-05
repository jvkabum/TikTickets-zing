<template>
  <div class="video-viewer" :class="{ 'vertical-video': isVertical }">
    <div class="video-container" :style="containerStyle">
      <video
        ref="videoElement"
        :src="src"
        controls
        class="viewer-video"
        preload="metadata"
        :poster="posterUrl"
        @loadedmetadata="onVideoMetadata"
      ></video>
      <div class="video-overlay" v-if="!loaded" @click="play">
        <q-icon name="play_arrow" size="60px" color="white" class="play-icon" />
      </div>
      <div class="video-actions" v-if="loaded">
        <q-btn round flat color="white" icon="fullscreen" @click="toggleFullscreen" class="shadow-3">
          <q-tooltip>Tela cheia</q-tooltip>
        </q-btn>
        <q-btn round flat color="white" icon="download" :href="src" download class="shadow-3">
          <q-tooltip>Baixar vídeo</q-tooltip>
        </q-btn>
      </div>
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
      default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiPkNhcnJlZ2FuZG8gdmlkZW8uLi48L3RleHQ+PC9zdmc+'
    }
  },
  data () {
    return {
      loaded: false,
      videoWidth: 0,
      videoHeight: 0,
      isVertical: false
    }
  },
  computed: {
    aspectRatio () {
      if (!this.videoWidth || !this.videoHeight) return 16 / 9
      return this.videoWidth / this.videoHeight
    },
    containerStyle () {
      if (!this.videoWidth || !this.videoHeight) return {}

      const isVertical = this.videoHeight > this.videoWidth
      const maxWidth = 500
      const maxHeight = 500

      let width, height

      if (isVertical) {
        height = Math.min(maxHeight, this.videoHeight)
        width = height * (this.videoWidth / this.videoHeight)
        if (width > maxWidth) {
          width = maxWidth
          height = width * (this.videoHeight / this.videoWidth)
        }
      } else {
        width = Math.min(maxWidth, this.videoWidth)
        height = width * (this.videoHeight / this.videoWidth)
        if (height > maxHeight) {
          height = maxHeight
          width = height * (this.videoWidth / this.videoHeight)
        }
      }

      return {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%'
      }
    }
  },
  methods: {
    play () {
      const video = this.$refs.videoElement
      if (video) {
        video.play()
        this.loaded = true
      }
    },
    toggleFullscreen () {
      const video = this.$refs.videoElement
      if (!video) return

      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        video.requestFullscreen()
      }
    },
    onVideoMetadata () {
      const video = this.$refs.videoElement
      if (video) {
        this.videoWidth = video.videoWidth
        this.videoHeight = video.videoHeight
        this.isVertical = video.videoHeight > video.videoWidth
      }
    }
  },
  mounted () {
    const video = this.$refs.videoElement
    if (video) {
      video.addEventListener('playing', () => {
        this.loaded = true
      })

      // Adiciona ouvinte para toques em dispositivos móveis
      this.$el.addEventListener('touchstart', this.play)
    }
  },
  beforeDestroy () {
    this.$el.removeEventListener('touchstart', this.play)
  }
}
</script>

<style lang="scss" scoped>
.video-viewer {
  width: 100%;
  max-width: 500px;
  min-width: 300px;
  margin: 10px auto;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #000;
  position: relative;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vertical-video .video-container {
  aspect-ratio: 9 / 16;
  min-height: 300px;
  max-height: 500px;
  width: 100%;
  max-width: 394px;
  margin: 0 auto;
}

.video-viewer:not(.vertical-video) .video-container {
  aspect-ratio: 16 / 9;
  min-height: 500px;
  max-height: 500px;
  width: 100%;
  max-width: 500px;
}

.viewer-video {
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
  background-color: #000;
  display: block;
  margin: 0 auto;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }

  .play-icon {
    opacity: 0.9;
    transition: transform 0.3s ease, opacity 0.3s ease;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  }

  &:hover .play-icon {
    transform: scale(1.1);
    opacity: 1;
  }
}

.video-actions {
  position: absolute;
  bottom: 70px;
  right: 15px;
  display: flex;
  gap: 10px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;

  .q-btn {
    background-color: rgba(0, 0, 0, 0.5);
    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
}

.video-container:hover .video-actions {
  opacity: 1;
}

@media (max-width: 500px) {
  .video-viewer {
    min-width: 100%;
    max-width: 100%;
    margin: 5px auto;
  }

  .video-container {
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
  }

  .vertical-video .video-container {
    min-height: 300px;
    max-height: 600px;
    max-width: 337px;
  }

  .video-viewer:not(.vertical-video) .video-container {
    min-height: 300px;
    max-height: 600px;
  }

  .viewer-video {
    max-width: 100%;
  }
}
</style>
