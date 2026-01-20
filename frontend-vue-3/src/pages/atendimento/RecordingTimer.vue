<template>
  <div class="timerBox">{{ addZero(timer.minutes) }}:{{ addZero(timer.seconds) }}</div>
</template>

<script setup>

const timer = reactive({
  minutes: 0,
  seconds: 0
})

let intervalId = null

const addZero = n => (n < 10 ? '0' + n : n)

const startInterval = () => {
  intervalId = setInterval(() => {
    if (timer.seconds === 59) {
      timer.minutes++
      timer.seconds = 0
    } else {
      timer.seconds++
    }
  }, 1000)
}

const stopInterval = () => {
  if (intervalId) clearInterval(intervalId)
}

onMounted(startInterval)
onUnmounted(stopInterval)
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
