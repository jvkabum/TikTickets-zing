<template>
  <div
    ref="containerRef"
    class="pdf-viewer-container"
    :class="{ 'compact-mode': compact, 'full-mode': !compact }"
  >
    <!-- Loading Overlay -->
    <div
      v-if="loading || rendering"
      class="pdf-loading-overlay absolute-full flex flex-center"
    >
      <q-spinner-dots
        color="primary"
        size="40px"
      />
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="pdf-error-state flex flex-center column q-pa-md text-center"
    >
      <q-icon
        name="mdi-alert-circle-outline"
        color="negative"
        size="36px"
      />
      <div class="text-caption text-weight-bold q-mt-xs">
        Não foi possível pré-visualizar este PDF aqui
      </div>
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        label="Baixar / Abrir externamente"
        :href="url"
        target="_blank"
        class="q-mt-xs"
      />
    </div>

    <!-- Canvas Area -->
    <div
      v-show="!error"
      class="pdf-canvas-wrapper"
      :class="{ 'compact-wrapper': compact, 'full-wrapper': !compact }"
    >
      <canvas
        ref="canvasRef"
        class="pdf-canvas"
      />
    </div>

    <!-- Controls Toolbar (Full Mode) -->
    <div
      v-if="!compact && pageCount > 0 && !error"
      class="pdf-toolbar row items-center justify-center q-gutter-x-xs q-px-md q-py-xs glass-dark"
    >
      <!-- Navegação de Páginas -->
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-chevron-left"
        color="white"
        :disable="pageNumber <= 1"
        @click="prevPage"
      >
        <q-tooltip>Página anterior</q-tooltip>
      </q-btn>

      <span class="text-caption text-white text-weight-bold q-mx-xs text-mono">
        {{ pageNumber }} / {{ pageCount }}
      </span>

      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-chevron-right"
        color="white"
        :disable="pageNumber >= pageCount"
        @click="nextPage"
      >
        <q-tooltip>Próxima página</q-tooltip>
      </q-btn>

      <q-separator
        vertical
        dark
        inset
        class="q-mx-sm"
      />

      <!-- Zoom -->
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-magnify-minus-outline"
        color="white"
        :disable="zoom <= 0.5"
        @click="zoomOut"
      >
        <q-tooltip>Diminuir zoom</q-tooltip>
      </q-btn>

      <span class="text-caption text-white text-weight-bold text-mono q-mx-xs" style="min-width: 45px; text-align: center;">
        {{ Math.round(zoom * 100) }}%
      </span>

      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-magnify-plus-outline"
        color="white"
        :disable="zoom >= 3.0"
        @click="zoomIn"
      >
        <q-tooltip>Aumentar zoom</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-fit-to-page-outline"
        color="white"
        @click="resetZoom"
      >
        <q-tooltip>Ajustar à tela</q-tooltip>
      </q-btn>

      <q-separator
        vertical
        dark
        inset
        class="q-mx-sm"
      />

      <!-- Download / Abrir -->
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-download"
        color="white"
        :href="url"
        :download="fileName || 'documento.pdf'"
        target="_blank"
      >
        <q-tooltip>Baixar PDF</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        dense
        size="sm"
        icon="mdi-open-in-new"
        color="white"
        :href="url"
        target="_blank"
      >
        <q-tooltip>Abrir em nova aba</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
const canvasRef = ref(null)
const loading = ref(true)
const rendering = ref(false)
const error = ref(false)
const pageNumber = ref(1)
const pageCount = ref(0)
const zoom = ref(1.0)

let pdfDoc = null
let renderTask = null
let resizeObserver = null
let containerWidth = 0

const initPdfJs = async () => {
  const pdfjsLib = await import('pdfjs-dist')
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  } catch (e) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`
  }
  return pdfjsLib
}

const loadDocument = async () => {
  if (!props.url) return
  loading.value = true
  error.value = false
  pageNumber.value = 1

  try {
    const pdfjsLib = await initPdfJs()
    const loadingTask = pdfjsLib.getDocument({
      url: props.url,
      withCredentials: false
    })

    pdfDoc = await loadingTask.promise
    pageCount.value = pdfDoc.numPages
    loading.value = false

    await renderCurrentPage()
  } catch (err) {
    console.error('[PdfViewer] Erro ao carregar PDF:', err)
    error.value = true
    loading.value = false
  }
}

const renderCurrentPage = async () => {
  if (!pdfDoc || !canvasRef.value) return
  rendering.value = true

  try {
    const page = await pdfDoc.getPage(pageNumber.value)
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    if (renderTask) {
      try {
        renderTask.cancel()
      } catch (e) {
        // Ignora cancelamento prévio
      }
    }

    const unscaledViewport = page.getViewport({ scale: 1.0 })
    const cWidth = containerWidth || containerRef.value?.clientWidth || 300
    const padding = props.compact ? 0 : 32
    const targetWidth = Math.max(200, cWidth - padding)
    const baseScale = targetWidth / unscaledViewport.width
    const finalScale = props.compact ? baseScale : baseScale * zoom.value

    const viewport = page.getViewport({ scale: finalScale })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.floor(viewport.width * pixelRatio)
    canvas.height = Math.floor(viewport.height * pixelRatio)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const renderContext = {
      canvasContext: ctx,
      viewport,
      transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    }

    renderTask = page.render(renderContext)
    await renderTask.promise
  } catch (err) {
    if (err?.name !== 'RenderingCancelledException') {
      console.error('[PdfViewer] Erro na renderização da página:', err)
    }
  } finally {
    rendering.value = false
  }
}

const prevPage = () => {
  if (pageNumber.value > 1) {
    pageNumber.value--
    renderCurrentPage()
  }
}

const nextPage = () => {
  if (pageNumber.value < pageCount.value) {
    pageNumber.value++
    renderCurrentPage()
  }
}

const zoomIn = () => {
  zoom.value = Math.min(3.0, +(zoom.value + 0.25).toFixed(2))
  renderCurrentPage()
}

const zoomOut = () => {
  zoom.value = Math.max(0.5, +(zoom.value - 0.25).toFixed(2))
  renderCurrentPage()
}

const resetZoom = () => {
  zoom.value = 1.0
  renderCurrentPage()
}

onMounted(() => {
  if (containerRef.value) {
    containerWidth = containerRef.value.clientWidth
    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width && Math.abs(entry.contentRect.width - containerWidth) > 15) {
          containerWidth = entry.contentRect.width
          renderCurrentPage()
        }
      }
    })
    resizeObserver.observe(containerRef.value)
  }
  loadDocument()
})

onUnmounted(() => {
  if (renderTask) {
    try { renderTask.cancel() } catch (e) {}
  }
  if (pdfDoc) {
    try { pdfDoc.destroy() } catch (e) {}
    pdfDoc = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.url, () => {
  loadDocument()
})
</script>

<style lang="scss" scoped>
.pdf-viewer-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #18181b;
  overflow: hidden;
}

.compact-mode {
  height: 220px;
  border-radius: 12px 12px 0 0;
}

.full-mode {
  height: 100%;
  min-height: 480px;
}

.pdf-loading-overlay {
  background: rgba(9, 9, 11, 0.65);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.pdf-error-state {
  height: 100%;
  color: #a1a1aa;
}

.pdf-canvas-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}

.compact-wrapper {
  overflow: hidden;
  align-items: flex-start;
}

.full-wrapper {
  padding: 16px;
}

.pdf-canvas {
  display: block;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  background-color: white;
}

.pdf-toolbar {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 0 12px 12px;
}

.glass-dark {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
}

.text-mono {
  font-family: monospace;
}
</style>
