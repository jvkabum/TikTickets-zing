<template>
  <div class="image-viewer">
    <div class="image-container">
      <q-img
        @click="openLightbox"
        :src="src"
        spinner-color="primary"
        class="viewer-image"
        :ratio="0"
        fit="scale-down"
        @load="onImageLoad"
      >
        <template v-slot:loading>
          <div class="absolute-full flex flex-center">
            <q-spinner-dots
              color="primary"
              size="40px"
            />
          </div>
        </template>
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">Erro ao carregar imagem</div>
        </template>
      </q-img>
      <div class="image-actions">
        <q-btn
          round
          flat
          color="white"
          icon="fullscreen"
          @click="openLightbox"
          class="shadow-3"
        >
          <q-tooltip>Ampliar imagem</q-tooltip>
        </q-btn>
        <q-btn
          round
          flat
          color="white"
          icon="download"
          :href="src"
          download
          class="shadow-3"
        >
          <q-tooltip>Baixar imagem</q-tooltip>
        </q-btn>
      </div>
    </div>

    <VueEasyLightbox
      moveDisabled
      :visible="isLightboxOpen"
      :imgs="src"
      :index="0"
      @hide="isLightboxOpen = false"
    />
  </div>
</template>

<script setup>
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Imagem'
  }
})

const isLightboxOpen = ref(false)
const imageWidth = ref(0)
const imageHeight = ref(0)

const aspectRatio = computed(() => {
  if (!imageWidth.value || !imageHeight.value) return 16 / 9
  return imageWidth.value / imageHeight.value
})

const openLightbox = () => {
  isLightboxOpen.value = true
}

const onImageLoad = () => {
  const img = new Image()
  img.onload = () => {
    imageWidth.value = img.width
    imageHeight.value = img.height
  }
  img.src = props.src
}
</script>

<style lang="scss" scoped>
.image-viewer {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  border-radius: 0px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 600px;
}

.viewer-image {
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.image-actions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
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

.image-container:hover .image-actions {
  opacity: 1;
}

.body--dark {
  .image-container {
    background-color: #2d2d2d;
  }
}

@media (max-width: 500px) {
  .image-viewer {
    max-width: 100%;
    margin: 5px auto;
  }

  .viewer-image {
    max-height: 60vh;
  }

  .image-actions {
    opacity: 1;
    bottom: 10px;
    right: 10px;
  }
}
</style>
