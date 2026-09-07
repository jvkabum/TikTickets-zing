<template>
  <div :class="['text-caption text-center q-pa-sm flex items-center justify-center q-gutter-x-xs', $q.dark.isActive ? 'bg-transparent text-grey-5' : 'bg-grey-1 text-grey-7']">
    <span class="text-weight-medium">Versão:</span>
    <q-badge
      outline
      color="primary"
      class="q-px-sm q-py-xs text-weight-bold cursor-pointer transition-all hover-scale"
      @click="openGithub"
    >
      v{{ cVersion }}
      <q-tooltip class="bg-primary shadow-2">Ver atualizações no GitHub</q-tooltip>
    </q-badge>
  </div>
</template>
<script setup>
import packageEnv from 'src/../package.json'
import { useQuasar, openURL } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()
const cVersion = computed(() => packageEnv.version)
const github = computed(() => packageEnv.github)

const openGithub = () => {
  if (github.value) {
    openURL(github.value)
  }
}
</script>

<style scoped>
.hover-scale {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
}

.hover-scale:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(var(--q-primary), 0.3);
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
