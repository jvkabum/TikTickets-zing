<template>
  <div class="audio-container">
    <div class="photo-container">
      <q-avatar size="45px" class="q-mr-sm">
        <img
          :src="avatarSrc || contact?.profilePicUrl"
          v-show="avatarSrc || contact?.profilePicUrl"
          @error="$event.target.style.display='none'"
        >
        <q-icon
          v-if="!avatarSrc && !contact?.profilePicUrl"
          name="person"
          size="45px"
          color="grey-5"
        />
      </q-avatar>
      <div class="rate-options" @click="toggleRate">
        <q-btn
          flat
          dense
          size="sm"
          :label="formatRate(audioRate)"
          color="white"
          class="q-px-xs"
        />
      </div>
      <q-icon
        name="mic"
        size="0.9rem"
        color="positive"
        class="mic-icon"
      />
    </div>

    <q-btn
      flat
      round
      dense
      :icon="isPlaying ? 'pause' : 'play_arrow'"
      @click="togglePlayPause"
      class="play-pause-btn"
    />

    <div class="time-container">
      <div class="time-label">
        {{ formattedCurrentTime }}
      </div>
      <div
        class="visualizer-container"
        ref="waveformRef"
        @click="handleVisualizerClick"
      />
      <div class="duration-label">
        {{ formattedDuration }}
      </div>
    </div>

    <div
      v-if="showRateControl"
      @click="incrementRate"
      class="rate-chip"
    >
      {{ formatRate(audioRate) }}
    </div>

    <audio
      ref="audioRef"
      :src="url"
      type="audio/mpeg"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
    >
      Seu navegador não suporta o elemento de áudio.
    </audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import WaveSurfer from 'wavesurfer.js'

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  contact: {
    type: Object,
    default: () => ({})
  },
  avatarSrc: {
    type: String,
    default: ''
  }
})

const LS_NAME = 'audioMessageRate'

const waveformRef = ref(null)
const audioRef = ref(null)
const wavesurfer = ref(null)
const audioRate = ref(parseFloat(localStorage.getItem(LS_NAME) || '1'))
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const formattedCurrentTime = ref('0:00')
const formattedDuration = ref('0:00')
const showRateControl = ref(false)

const formatRate = (rate) => {
  return rate
}

const formatTime = (time) => {
  if (isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const togglePlayPause = () => {
  if (wavesurfer.value) {
    wavesurfer.value.playPause()
  }
}

const toggleRate = () => {
  const rates = [1, 1.5, 2]
  const currentIndex = rates.indexOf(audioRate.value)
  const nextRate = rates[(currentIndex + 1) % rates.length]
  setRate(nextRate)
}

const setRate = (rate) => {
  audioRate.value = rate
  if (wavesurfer.value) {
    wavesurfer.value.setPlaybackRate(rate)
  }
  localStorage.setItem(LS_NAME, rate)
}

const handleLoadedMetadata = () => {
  const audio = audioRef.value
  duration.value = audio.duration
  formattedDuration.value = formatTime(audio.duration)
}

const handleTimeUpdate = () => {
  const audio = audioRef.value
  currentTime.value = audio.currentTime
  formattedCurrentTime.value = formatTime(audio.currentTime)
}

const handlePlay = () => {
  isPlaying.value = true
  showRateControl.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  formattedCurrentTime.value = '0:00'
  showRateControl.value = false
}

const handleVisualizerClick = (event) => {
  if (wavesurfer.value) {
    const rect = waveformRef.value.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const ratio = clickX / rect.width
    wavesurfer.value.seekTo(ratio)
  }
}

const initWaveSurfer = () => {
  wavesurfer.value = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#999',
    progressColor: '#1976D2',
    cursorColor: 'transparent',
    barWidth: 2,
    barGap: 1,
    height: 35,
    responsive: true,
    normalize: true,
    fillParent: true,
    minPxPerSec: 50,
    interact: true
  })

  wavesurfer.value.load(props.url)

  wavesurfer.value.on('play', () => {
    isPlaying.value = true
    showRateControl.value = true
  })

  wavesurfer.value.on('pause', () => {
    isPlaying.value = false
  })

  wavesurfer.value.on('finish', () => {
    handleEnded()
  })

  wavesurfer.value.on('audioprocess', () => {
    currentTime.value = wavesurfer.value.getCurrentTime()
    formattedCurrentTime.value = formatTime(currentTime.value)
  })

  wavesurfer.value.on('ready', () => {
    duration.value = wavesurfer.value.getDuration()
    formattedDuration.value = formatTime(duration.value)
    wavesurfer.value.setPlaybackRate(audioRate.value)
  })
}

const incrementRate = () => {
  const rates = [1, 1.5, 2]
  const currentIndex = rates.indexOf(audioRate.value)
  const nextRate = rates[(currentIndex + 1) % rates.length]
  setRate(nextRate)
}

onMounted(() => {
  initWaveSurfer()
})

onUnmounted(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
.audio-container {
  display: flex;
  align-items: center;
  padding: 20px 8px 0px 0;
  margin-bottom: 2px;
  border-radius: 120px;
  border: none;
  width: 370px;
  min-width: 300px;
  height: 31px;
  position: relative;
  box-sizing: border-box;
}

.photo-container {
  display: flex;
  align-items: center;
  position: relative;
  min-width: 70px;
  margin-right: 0;
  top: 2px;
  cursor: pointer;

  &:hover .rate-options {
    display: flex;
    animation: fadeIn 0.2s ease;
  }
}

.rate-options {
  display: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  padding: 4px 12px;
  z-index: 2;
  transition: all 0.2s ease;
  cursor: pointer;

  .q-btn {
    color: #fff;
    font-size: 0.85rem;
    min-height: 24px;
    font-weight: 500;

    &:hover {
      background: transparent;
    }
  }

  &:hover {
    background: #2d3748;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: #1f2937;
  }
}

.mic-icon {
  position: absolute;
  bottom: 0;
  right: 5px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
  top: 12px;
  box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
}

.play-pause-btn {
  padding: 0;
  margin-right: 0;
  min-width: 24px;
  top: -1px;
}

.time-container {
  display: flex;
  flex: 1;
  align-items: center;
  position: relative;
  margin: 0;
  top: -1px;
}

.time-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  min-width: 30px;
  padding: 0 2px;
}

.duration-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  min-width: 30px;
  padding: 0 2px;
}

.rate-chip {
  position: absolute;
  left: 8px;
  top: -6px;
  font-size: 0.75rem;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 80px;
  z-index: 1;
}

.visualizer-container {
  flex: 1;
  top: -1px;
  position: relative;
  cursor: pointer;
  height: 33px;
  margin: 0;
  padding: 0;
  z-index: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
