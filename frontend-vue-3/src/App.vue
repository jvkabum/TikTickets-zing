<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script setup>

const $q = useQuasar()

onBeforeMount(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  if (usuario?.configs?.isDark) {
    $q.dark.set(usuario?.configs?.isDark)
  }
})
</script>
