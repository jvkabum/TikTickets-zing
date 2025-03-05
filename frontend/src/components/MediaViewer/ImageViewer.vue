<template>
  <div class="image-viewer" :class="{ 'vertical-media': isVertical }">
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
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            Erro ao carregar imagem
          </div>
        </template>
      </q-img>
      <div class="image-actions">
        <q-btn round flat color="white" icon="fullscreen" @click="openLightbox" class="shadow-3">
          <q-tooltip>Ampliar imagem</q-tooltip>
        </q-btn>
        <q-btn round flat color="white" icon="download" :href="src" download class="shadow-3">
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

<script>
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'ImageViewer',
  components: {
    VueEasyLightbox
  },
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Imagem'
    }
  },
  data () {
    return {
      isLightboxOpen: false,
      imageWidth: 0,
      imageHeight: 0,
      isVertical: false
    }
  },
  computed: {
    aspectRatio () {
      if (!this.imageWidth || !this.imageHeight) return 16 / 9
      return this.imageWidth / this.imageHeight
    },
    imageRatio () {
      // Se a imagem é vertical (mais alta que larga), usamos proporção diferente
      if (this.isVertical) {
        return 9 / 16
      }
      return 16 / 9
    }
  },
  methods: {
    openLightbox () {
      this.isLightboxOpen = true
    },
    onImageLoad (e) {
      // Acessa a imagem depois que carregou
      const img = new Image()
      img.onload = () => {
        this.imageWidth = img.width
        this.imageHeight = img.height
        this.isVertical = img.height > img.width
      }
      img.src = this.src
    }
  }
}
</script>

<style lang="scss" scoped>
.image-viewer {
  width: 100%;
  max-width: 700px; /* Dobrado de 650px */
  min-width: 500px;
  margin: 10px auto;
  overflow: visible;
}

.image-viewer.vertical-media {
  max-width: 700px; /* Dobrado de 400px */
}

.image-container {
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background-color: #f5f5f5;
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

.viewer-image {
  width: 100%;
  max-width: 100%;
  min-height: 500px; /* Dobrado de 250px */
  max-height: 700px; /* Dobrado de 600px */
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.vertical-media .viewer-image {
  min-height: 500px; /* Dobrado de 350px */
  max-height: 700px; /* Dobrado de 650px */
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

@media (max-width: 900px) {
  .image-viewer {
    max-width: 700px;
  }

  .image-viewer.vertical-media {
    max-width: 700px;
  }

  .viewer-image {
    min-height: 500px;
    max-height: 700px;
  }

  .vertical-media .viewer-image {
    min-height: 500px;
    max-height: 700px;
  }
}

@media (max-width: 700px) {
  .image-viewer {
    max-width: 100%;
  }

  .image-viewer.vertical-media {
    max-width: 90%;
  }

  .viewer-image {
    min-height: 500px;
    max-height: 700px;
  }
}
</style>
