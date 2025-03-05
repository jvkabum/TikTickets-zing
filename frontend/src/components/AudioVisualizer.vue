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

<script>
import WaveSurfer from 'wavesurfer.js'

const LS_NAME = 'audioMessageRate'

export default {
  name: 'AudioVisualizer',
  props: {
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
  },
  data () {
    return {
      audioRate: parseFloat(localStorage.getItem(LS_NAME) || '1'),
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      formattedCurrentTime: '0:00',
      formattedDuration: '0:00',
      showRateControl: false,
      wavesurfer: null
    }
  },
  methods: {
    formatRate (rate) {
      return rate
    },
    formatTime (time) {
      if (isNaN(time)) return '0:00'
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    },
    togglePlayPause () {
      if (this.wavesurfer) {
        this.wavesurfer.playPause()
      }
    },
    toggleRate () {
      const rates = [1, 2, 3, 4]
      const currentIndex = rates.indexOf(this.audioRate)
      const nextRate = rates[(currentIndex + 1) % rates.length]
      this.setRate(nextRate)
    },
    setRate (rate) {
      this.audioRate = rate
      if (this.wavesurfer) {
        this.wavesurfer.setPlaybackRate(rate)
      }
      localStorage.setItem(LS_NAME, rate)
    },
    handleLoadedMetadata () {
      const audio = this.$refs.audioRef
      this.duration = audio.duration
      this.formattedDuration = this.formatTime(audio.duration)
    },
    handleTimeUpdate () {
      const audio = this.$refs.audioRef
      this.currentTime = audio.currentTime
      this.formattedCurrentTime = this.formatTime(audio.currentTime)
    },
    handlePlay () {
      this.isPlaying = true
      this.showRateControl = true
    },
    handlePause () {
      this.isPlaying = false
    },
    handleEnded () {
      this.isPlaying = false
      this.currentTime = 0
      this.formattedCurrentTime = '0:00'
      this.showRateControl = false
    },
    handleVisualizerClick (event) {
      if (this.wavesurfer) {
        const rect = this.$refs.waveformRef.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        const ratio = clickX / rect.width
        this.wavesurfer.seekTo(ratio)
      }
    },
    initWaveSurfer () {
      this.wavesurfer = WaveSurfer.create({
        container: this.$refs.waveformRef,
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

      this.wavesurfer.load(this.url)

      this.wavesurfer.on('play', () => {
        this.isPlaying = true
        this.showRateControl = true
      })

      this.wavesurfer.on('pause', () => {
        this.isPlaying = false
      })

      this.wavesurfer.on('finish', () => {
        this.handleEnded()
      })

      this.wavesurfer.on('audioprocess', () => {
        this.currentTime = this.wavesurfer.getCurrentTime()
        this.formattedCurrentTime = this.formatTime(this.currentTime)
      })

      this.wavesurfer.on('ready', () => {
        this.duration = this.wavesurfer.getDuration()
        this.formattedDuration = this.formatTime(this.duration)
        this.wavesurfer.setPlaybackRate(this.audioRate)
      })
    },
    incrementRate () {
      const rates = [1, 2, 3, 4]
      const currentIndex = rates.indexOf(this.audioRate)
      const nextRate = rates[(currentIndex + 1) % rates.length]
      this.setRate(nextRate)
    }
  },
  async mounted () {
    this.initWaveSurfer()
  },
  beforeDestroy () {
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
    }
  }
}
</script>

<style lang="scss" scoped>
.audio-container {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 0;
  margin-bottom: 2px;
  border-radius: 120px;
  border: none;
  width: 370px;
  min-width: 300px;
  height: 40px;
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
