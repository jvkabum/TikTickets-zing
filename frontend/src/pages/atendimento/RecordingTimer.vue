<template>
  <div class="timerBox">
    {{ addZero(timer.minutes) }}:{{ addZero(timer.seconds) }}
  </div>
</template>

<script>
export default {
  name: 'RecordingTimer',
  data () {
    return {
      timer: {
        minutes: 0,
        seconds: 0
      },
      intervalId: null
    }
  },
  methods: {
    interval () {
      this.intervalId = setInterval(() => {
        if (this.timer.seconds === 59) {
          this.timer = {
            ...this.timer,
            minutes: this.timer.minutes + 1,
            seconds: 0
          }
        } else {
          this.timer = {
            ...this.timer,
            seconds: this.timer.seconds + 1
          }
        }
      }, 1000)
    },
    stopInteval () {
      if (this.intervalId) {
        clearInterval(this.intervalId)
      }
    },
    addZero (n) {
      return n < 10 ? '0' + n : n
    }
  },
  mounted () {
    this.interval()
  },
  unmounted () {
    this.stopInteval()
  }
}
</script>

<style lang="scss" scoped>
.timerBox {
  width: 45px;
  text-align: center;
  font-size: 14px;
  margin-left: 5px;
  margin-right: 5px;
}
</style>
