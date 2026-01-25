<template>
  <div :class="['text-caption text-center q-pa-sm', $q.dark.isActive ? 'bg-transparent' : 'bg-grey-1']">
    Versão Sistema:
    <q-badge
      align="middle"
      color="primary"
    >
      <a
        target="_blank"
        :href="github"
      >
        v{{ cVersion }}
      </a>
    </q-badge>
  </div>
</template>
<script setup>
import packageEnv from 'src/../package.json'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const cVersion = computed(() => packageEnv.version)
const github = computed(() => packageEnv.github)
</script>
<style></style>
