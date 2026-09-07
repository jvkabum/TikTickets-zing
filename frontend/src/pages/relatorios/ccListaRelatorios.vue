<template>
  <q-card
    v-if="userProfile === 'admin'"
    class="q-ma-md q-pa-sm glass-premium no-shadow border-glass"
    style="min-height: calc(100vh - 130px)"
  >
    <q-card-section class="row wrap justify-start items-center content-center q-pa-sm q-mb-md">
      <q-list
        v-for="menu in relatorios"
        :key="menu.name"
        class="q-pa-md items-center"
      >
        <q-item
          style="
            min-width: 340px;
            max-width: 340px;
            width: 340px;
            min-height: 90px;
            height: 90px;
            max-height: 90px;
          "
          class="glass-premium border-glass shadow-premium q-px-sm items-start hover-premium rounded-all"
          clickable
          v-ripple
          :to="{ name: menu.name }"
        >
          <q-item-section>
            <q-item-label class="text-primary text-bold text-h6">{{ menu.titulo }}</q-item-label>
            <q-item-label caption class="text-dark-theme">{{ menu.objetivo }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import relatorios from './relatorios.json'

const userProfile = ref('user')

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
})
</script>

<style lang="scss" scoped></style>
