<template>
  <div class="video-viewer">
    <div
      class="video-container"
      :style="containerStyle"
    >
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

<script setup>

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    default: ''
  }
})

const videoWidth = ref(0)
const videoHeight = ref(0)
const videoElement = ref(null)

const isVerticalVideo = computed(() => {
  return videoHeight.value > videoWidth.value
})

const containerStyle = computed(() => {
  if (!videoWidth.value || !videoHeight.value) return {}

  const aspect = videoWidth.value / videoHeight.value
  const width = '400px'
  let height

  if (aspect >= 1) {
    height = `${400 / aspect}px`
  } else {
    height = `${Math.min(400 / aspect, 600)}px`
  }

  return { width, height }
})

const onVideoMetadata = () => {
  if (videoElement.value) {
    videoWidth.value = videoElement.value.videoWidth
    videoHeight.value = videoElement.value.videoHeight
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
