<template>
  <div>
    <q-select
      borderless
      dense
      rounded
      v-model="statusUsuario"
      :options="statusOptions"
      map-options
      emit-value
    >
      <template v-slot:selected>
        <div class="row full-width justify-center">
          <q-chip
            color="grey-3"
            text-color="primary"
            class="q-my-none q-ml-sm q-mr-none q-py-md"
          >
            <q-avatar
              :color="cStatus.color"
              text-color="white"
              size="40px"
              :icon="cStatus.icon"
              rounded
            />
            {{ cStatus.label }}
          </q-chip>
        </div>
      </template>
    </q-select>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:usuario'])

const statusOptions = [
  {
    label: 'Online',
    value: 'online',
    icon: 'mdi-account-check',
    color: 'positive'
  },
  {
    label: 'Offline',
    value: 'offline',
    icon: 'mdi-account-off',
    color: 'negative'
  }
]

const cStatus = computed(() => {
  return statusOptions.find(s => s.value === props.usuario?.status) || {}
})

const statusUsuario = computed({
  get: () => props.usuario?.status,
  set: value => {
    const usuario = { ...props.usuario, status: value }
    localStorage.setItem('usuario', JSON.stringify(usuario))
    emit('update:usuario', usuario)
  }
})
</script>

<style></style>
