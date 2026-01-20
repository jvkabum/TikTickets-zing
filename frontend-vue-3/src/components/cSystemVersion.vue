<template>
  <div class="text-caption text-center bg-grey-1 q-pa-sm">
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

const cVersion = computed(() => packageEnv.version)
const github = computed(() => packageEnv.github)
</script>
<style></style>
