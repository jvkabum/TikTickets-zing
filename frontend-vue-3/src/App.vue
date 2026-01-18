<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { onBeforeMount } from 'vue'

const $q = useQuasar()

onBeforeMount(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  if (usuario?.configs?.isDark) {
    $q.dark.set(usuario?.configs?.isDark)
  }
})
</script>
