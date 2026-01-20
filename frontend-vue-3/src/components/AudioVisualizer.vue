<template>
  <div class="audio-container">
    <div class="photo-container relative-position">
      <q-avatar
        size="45px"
        class="q-mr-sm shadow-1"
      >
        <img :src="avatarSrc || defaultAvatar" />
      </q-avatar>
      <q-icon
        v-if="!fromMe"
        name="mdi-microphone"
        size="12px"
        class="mic-icon shadow-2 text-blue-8"
        style="position: absolute; bottom: 0; right: 8px; background: white; border-radius: 50%; padding: 1px"
      />
    </div>

    <div class="controls-visualizer-container row no-wrap items-center full-width">
      <q-btn
        flat
        round
        dense
        :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
        color="grey-9"
        @click="togglePlayPause"
        class="play-pause-btn q-mr-xs"
      />

      <div
        class="visualizer-wrapper col relative-position"
        ref="waveformRef"
      >
        <!-- Wavesurfer container -->
      </div>

      <div class="duration-label text-caption text-grey-8 q-mx-xs">
        {{ formattedTime }}
      </div>

      <div
        @click="incrementRate"
        class="rate-chip cursor-pointer text-bold text-caption bg-grey-3 q-px-xs rounded-borders"
      >
        {{ rate }}x
      </div>
    </div>
  </div>
</template>

<script setup>
import defaultAvatar from 'src/assets/avatar.png'
import WaveSurfer from 'wavesurfer.js'

const props = defineProps({
  url: { type: String, required: true },
  contact: { type: Object, default: () => ({}) },
  avatarSrc: { type: String, default: '' },
  fromMe: { type: Boolean, default: false }
})

const LS_RATE = 'audioMessageRate'
const waveformRef = ref(null)
const wavesurfer = ref(null)
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const rate = ref(Number(localStorage.getItem(LS_RATE)) || 1)

const formattedTime = computed(() => {
  const time = isPlaying.value ? currentTime.value : duration.value
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const initWaveSurfer = () => {
  wavesurfer.value = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#BDBDBD',
    progressColor: '#1976D2',
    cursorColor: 'transparent',
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 1,
    height: 30,
    barGap: 3,
    url: props.url
  })

  wavesurfer.value.on('ready', () => {
    duration.value = wavesurfer.value.getDuration()
    wavesurfer.value.setPlaybackRate(rate.value)
  })

  wavesurfer.value.on('audioprocess', () => {
    currentTime.value = wavesurfer.value.getCurrentTime()
  })

  wavesurfer.value.on('play', () => (isPlaying.value = true))
  wavesurfer.value.on('pause', () => (isPlaying.value = false))
  wavesurfer.value.on('finish', () => {
    isPlaying.value = false
    currentTime.value = 0
  })
}

const togglePlayPause = () => {
  wavesurfer.value?.playPause()
}

const incrementRate = () => {
  if (rate.value === 1) rate.value = 1.5
  else if (rate.value === 1.5) rate.value = 2
  else rate.value = 1

  localStorage.setItem(LS_RATE, rate.value)
  wavesurfer.value?.setPlaybackRate(rate.value)
}

onMounted(() => {
  initWaveSurfer()
})

onUnmounted(() => {
  wavesurfer.value?.destroy()
})

watch(
  () => props.url,
  newUrl => {
    if (newUrl) {
      wavesurfer.value?.load(newUrl)
    }
  }
)
</script>

<style lang="scss" scoped>
.audio-container {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 40px;
  width: 100%;
  max-width: 350px;
  min-width: 280px;
}

.visualizer-wrapper {
  height: 30px;
  overflow: hidden;
}

.rate-chip {
  min-width: 35px;
  text-align: center;
  user-select: none;
  font-size: 10px;
  height: 20px;
  line-height: 20px;
}

.play-pause-btn {
  z-index: 1;
}

.duration-label {
  min-width: 40px;
  text-align: right;
  font-size: 11px;
}
</style>
