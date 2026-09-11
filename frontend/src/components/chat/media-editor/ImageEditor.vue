<template>
  <div class="image-editor-root column full-height bg-zinc-950 text-white">
    <!-- Top Toolbar -->
    <div class="editor-header row items-center justify-between q-px-md q-py-xs bg-black-80 border-b-glass">
      <!-- Tools -->
      <div class="row items-center q-gutter-x-xs">
        <q-btn
          flat
          round
          dense
          icon="mdi-cursor-default-outline"
          :color="currentTool === 'select' ? 'primary' : 'grey-5'"
          @click="currentTool = 'select'"
        >
          <q-tooltip>Visualizar</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-pencil"
          :color="currentTool === 'pen' ? 'primary' : 'grey-5'"
          @click="currentTool = 'pen'"
        >
          <q-tooltip>Caneta livre</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-arrow-top-right-thick"
          :color="currentTool === 'arrow' ? 'primary' : 'grey-5'"
          @click="currentTool = 'arrow'"
        >
          <q-tooltip>Desenhar seta</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-blur"
          :color="currentTool === 'blur' ? 'primary' : 'grey-5'"
          @click="currentTool = 'blur'"
        >
          <q-tooltip>Tarjar / Ocultar dados sensíveis</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-crop"
          :color="currentTool === 'crop' ? 'primary' : 'grey-5'"
          @click="toggleCropMode"
        >
          <q-tooltip>Cortar imagem</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-rotate-right"
          color="grey-5"
          @click="rotateClockwise"
        >
          <q-tooltip>Girar 90°</q-tooltip>
        </q-btn>

        <q-separator vertical dark inset class="q-mx-xs" />

        <!-- Filtros Rápidos -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          color="grey-4"
          icon="mdi-tune"
          :label="presetLabel"
          size="sm"
        >
          <q-list dense dark class="bg-grey-10">
            <q-item clickable v-close-popup @click="setPreset('none')">
              <q-item-section>Normal</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setPreset('comprovante')">
              <q-item-section>
                <q-item-label>Comprovante (Nitidez)</q-item-label>
                <q-item-label caption class="text-grey-5">Realça números e letras de recibos</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setPreset('bw')">
              <q-item-section>Preto e Branco</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setPreset('vivid')">
              <q-item-section>Cores Vivas</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Colors & Actions -->
      <div class="row items-center q-gutter-x-xs">
        <!-- Palette (se ferramenta ativa for desenho) -->
        <template v-if="['pen', 'arrow'].includes(currentTool)">
          <div
            v-for="c in colorPalette"
            :key="c"
            class="color-dot cursor-pointer"
            :class="{ active: currentColor === c }"
            :style="{ backgroundColor: c }"
            @click="currentColor = c"
          />
          <q-separator vertical dark inset class="q-mx-xs" />
        </template>

        <!-- Undo & Reset -->
        <q-btn
          flat
          round
          dense
          icon="mdi-undo"
          color="grey-4"
          :disable="history.length === 0"
          @click="undoLastAction"
        >
          <q-tooltip>Desfazer</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="mdi-refresh"
          color="grey-4"
          @click="resetAllEdits"
        >
          <q-tooltip>Restaurar original</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Canvas Workspace -->
    <div
      ref="workspaceRef"
      class="editor-workspace col flex flex-center relative-position overflow-hidden"
    >
      <div
        class="canvas-container relative-position"
        :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
      >
        <canvas
          ref="canvasRef"
          class="main-canvas"
          @mousedown="handlePointerDown"
          @mousemove="handlePointerMove"
          @mouseup="handlePointerUp"
          @mouseleave="handlePointerUp"
          @touchstart.prevent="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend.prevent="handleTouchEnd"
        />

        <!-- Active Crop Box Overlay -->
        <div
          v-if="currentTool === 'crop' && cropBox"
          class="crop-overlay absolute"
          :style="{
            left: cropBox.x + 'px',
            top: cropBox.y + 'px',
            width: cropBox.w + 'px',
            height: cropBox.h + 'px'
          }"
        >
          <div class="crop-grid absolute-full" />
          <div class="crop-actions absolute-bottom row justify-center q-gutter-xs q-pb-xs">
            <q-btn
              dense
              round
              size="sm"
              color="positive"
              icon="mdi-check"
              @click="applyCrop"
            >
              <q-tooltip>Confirmar corte</q-tooltip>
            </q-btn>
            <q-btn
              dense
              round
              size="sm"
              color="negative"
              icon="mdi-close"
              @click="cancelCrop"
            >
              <q-tooltip>Cancelar corte</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  loadImage,
  applyCanvasFilters,
  drawArrow,
  drawPen,
  applyBlurRect,
  canvasToFile
} from './utils/canvasDraw'

const props = defineProps({
  file: {
    type: File,
    required: true
  }
})

const canvasRef = ref(null)
const workspaceRef = ref(null)

const currentTool = ref('pen') // 'select', 'pen', 'arrow', 'blur', 'crop'
const currentColor = ref('#ef4444')
const currentStrokeWidth = ref(6)
const rotationAngle = ref(0)
const currentPreset = ref('none')

const displayWidth = ref(600)
const displayHeight = ref(400)

const colorPalette = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#ffffff', '#09090b']

const history = ref([]) // Guarda os strokes/ações
const cropBox = ref(null)

let originalImageElement = null
let isInteracting = false
let currentPoints = []
let startDragPoint = null

const presetLabel = computed(() => {
  const map = {
    none: 'Filtro: Normal',
    comprovante: 'Filtro: Comprovante',
    bw: 'Filtro: P&B',
    vivid: 'Filtro: Vívido'
  }
  return map[currentPreset.value] || 'Filtro'
})

const initImage = async () => {
  if (!props.file) return
  try {
    originalImageElement = await loadImage(props.file)
    calculateDisplayDimensions()
    redrawAll()
  } catch (e) {
    console.error('[ImageEditor] Erro ao carregar imagem:', e)
  }
}

const calculateDisplayDimensions = () => {
  if (!originalImageElement || !workspaceRef.value) return
  const maxW = workspaceRef.value.clientWidth - 32
  const maxH = workspaceRef.value.clientHeight - 32

  const isSideways = rotationAngle.value % 180 !== 0
  const natW = isSideways ? originalImageElement.naturalHeight : originalImageElement.naturalWidth
  const natH = isSideways ? originalImageElement.naturalWidth : originalImageElement.naturalHeight

  const scale = Math.min(maxW / natW, maxH / natH, 1.0)
  displayWidth.value = Math.round(natW * scale)
  displayHeight.value = Math.round(natH * scale)

  if (canvasRef.value) {
    canvasRef.value.width = displayWidth.value
    canvasRef.value.height = displayHeight.value
  }
}

const redrawAll = () => {
  const canvas = canvasRef.value
  if (!canvas || !originalImageElement) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  // Aplica rotação centrada
  if (rotationAngle.value !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotationAngle.value * Math.PI) / 180)
    const isSideways = rotationAngle.value % 180 !== 0
    const w = isSideways ? canvas.height : canvas.width
    const h = isSideways ? canvas.width : canvas.height
    applyCanvasFilters(ctx, { preset: currentPreset.value })
    ctx.drawImage(originalImageElement, -w / 2, -h / 2, w, h)
  } else {
    applyCanvasFilters(ctx, { preset: currentPreset.value })
    ctx.drawImage(originalImageElement, 0, 0, canvas.width, canvas.height)
  }
  ctx.restore()

  // Desenha o histórico de ações
  for (const action of history.value) {
    if (action.tool === 'pen') {
      drawPen(ctx, action.points, action.color, action.width)
    } else if (action.tool === 'arrow') {
      drawArrow(ctx, action.from.x, action.from.y, action.to.x, action.to.y, action.color, action.width)
    } else if (action.tool === 'blur') {
      applyBlurRect(ctx, action.rect, 'redact')
    }
  }
}

const rotateClockwise = () => {
  rotationAngle.value = (rotationAngle.value + 90) % 360
  calculateDisplayDimensions()
  redrawAll()
}

const setPreset = preset => {
  currentPreset.value = preset
  redrawAll()
}

const undoLastAction = () => {
  if (history.value.length > 0) {
    history.value.pop()
    redrawAll()
  }
}

const resetAllEdits = () => {
  history.value = []
  rotationAngle.value = 0
  currentPreset.value = 'none'
  cropBox.value = null
  calculateDisplayDimensions()
  redrawAll()
}

const toggleCropMode = () => {
  if (currentTool.value === 'crop') {
    currentTool.value = 'select'
    cropBox.value = null
  } else {
    currentTool.value = 'crop'
    // Inicia caixa de corte no centro (70% do tamanho)
    const w = Math.round(displayWidth.value * 0.75)
    const h = Math.round(displayHeight.value * 0.75)
    cropBox.value = {
      x: Math.round((displayWidth.value - w) / 2),
      y: Math.round((displayHeight.value - h) / 2),
      w,
      h
    }
  }
}

const applyCrop = () => {
  if (!cropBox.value || !canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const croppedData = ctx.getImageData(cropBox.value.x, cropBox.value.y, cropBox.value.w, cropBox.value.h)

  // Cria imagem intermediária para virar o novo original
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = cropBox.value.w
  tempCanvas.height = cropBox.value.h
  tempCanvas.getContext('2d').putImageData(croppedData, 0, 0)

  const newImg = new Image()
  newImg.src = tempCanvas.toDataURL()
  newImg.onload = () => {
    originalImageElement = newImg
    rotationAngle.value = 0
    history.value = []
    cropBox.value = null
    currentTool.value = 'select'
    calculateDisplayDimensions()
    redrawAll()
  }
}

const cancelCrop = () => {
  cropBox.value = null
  currentTool.value = 'select'
}

// Eventos de Mouse e Touch
const getCanvasCoords = evt => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY
  return {
    x: Math.round(clientX - rect.left),
    y: Math.round(clientY - rect.top)
  }
}

const handlePointerDown = evt => {
  if (currentTool.value === 'select' || currentTool.value === 'crop') return
  isInteracting = true
  const coords = getCanvasCoords(evt)
  startDragPoint = coords
  currentPoints = [coords]
}

const handlePointerMove = evt => {
  if (!isInteracting) return
  const coords = getCanvasCoords(evt)
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  if (currentTool.value === 'pen') {
    currentPoints.push(coords)
    redrawAll()
    drawPen(ctx, currentPoints, currentColor.value, currentStrokeWidth.value)
  } else if (currentTool.value === 'arrow') {
    redrawAll()
    drawArrow(ctx, startDragPoint.x, startDragPoint.y, coords.x, coords.y, currentColor.value, currentStrokeWidth.value)
  } else if (currentTool.value === 'blur') {
    redrawAll()
    const rect = {
      x: Math.min(startDragPoint.x, coords.x),
      y: Math.min(startDragPoint.y, coords.y),
      width: Math.abs(coords.x - startDragPoint.x),
      height: Math.abs(coords.y - startDragPoint.y)
    }
    applyBlurRect(ctx, rect, 'redact')
  }
}

const handlePointerUp = evt => {
  if (!isInteracting) return
  isInteracting = false
  const coords = getCanvasCoords(evt)

  if (currentTool.value === 'pen' && currentPoints.length > 1) {
    history.value.push({
      tool: 'pen',
      points: [...currentPoints],
      color: currentColor.value,
      width: currentStrokeWidth.value
    })
  } else if (currentTool.value === 'arrow' && startDragPoint) {
    history.value.push({
      tool: 'arrow',
      from: { ...startDragPoint },
      to: { ...coords },
      color: currentColor.value,
      width: currentStrokeWidth.value
    })
  } else if (currentTool.value === 'blur' && startDragPoint) {
    history.value.push({
      tool: 'blur',
      rect: {
        x: Math.min(startDragPoint.x, coords.x),
        y: Math.min(startDragPoint.y, coords.y),
        width: Math.abs(coords.x - startDragPoint.x),
        height: Math.abs(coords.y - startDragPoint.y)
      }
    })
  }

  currentPoints = []
  startDragPoint = null
  redrawAll()
}

const handleTouchStart = evt => handlePointerDown(evt)
const handleTouchMove = evt => handlePointerMove(evt)
const handleTouchEnd = evt => handlePointerUp(evt)

// Método exposto para gerar o File pronto para envio
const getEditedFile = async () => {
  if (!canvasRef.value) return props.file
  return await canvasToFile(canvasRef.value, props.file.name, props.file.type || 'image/jpeg', 0.92)
}

defineExpose({
  getEditedFile,
  resetAllEdits
})

onMounted(() => {
  window.addEventListener('resize', calculateDisplayDimensions)
  initImage()
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateDisplayDimensions)
})

watch(() => props.file, () => {
  initImage()
})
</script>

<style lang="scss" scoped>
.image-editor-root {
  background-color: #09090b;
}

.border-b-glass {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.editor-workspace {
  user-select: none;
}

.main-canvas {
  display: block;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
  background-color: #18181b;
  cursor: crosshair;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: transform 0.15s, border-color 0.15s;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    border-color: #ffffff;
    transform: scale(1.25);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
  }
}

.crop-overlay {
  border: 2px dashed #38bdf8;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65);
  pointer-events: all;
  box-sizing: border-box;
}

.crop-grid {
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 33.33% 33.33%;
}
</style>
