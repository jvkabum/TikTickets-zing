<template>
  <q-badge
    :color="statusColor"
    :text-color="textColor"
    class="campanha-status"
    rounded
  >
    <q-icon
      v-if="showIcon"
      :name="statusIcon"
      size="12px"
      class="q-mr-xs"
    />
    {{ statusLabel }}
  </q-badge>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const statusConfig = {
  pending: {
    color: 'grey-4',
    textColor: 'grey-8',
    label: 'Pendente',
    icon: 'mdi-clock-outline'
  },
  scheduled: {
    color: 'blue',
    textColor: 'white',
    label: 'Agendada',
    icon: 'mdi-calendar-clock'
  },
  processing: {
    color: 'orange',
    textColor: 'white',
    label: 'Enviando',
    icon: 'mdi-send'
  },
  finished: {
    color: 'positive',
    textColor: 'white',
    label: 'Finalizada',
    icon: 'mdi-check-circle'
  },
  cancelled: {
    color: 'negative',
    textColor: 'white',
    label: 'Cancelada',
    icon: 'mdi-cancel'
  },
  failed: {
    color: 'negative',
    textColor: 'white',
    label: 'Falhou',
    icon: 'mdi-alert-circle'
  }
}

const config = computed(() => statusConfig[props.status] || statusConfig.pending)

const statusColor = computed(() => config.value.color)
const textColor = computed(() => config.value.textColor)
const statusLabel = computed(() => config.value.label)
const statusIcon = computed(() => config.value.icon)
</script>

<style lang="scss" scoped>
.campanha-status {
  font-size: 10px;
  padding: 4px 8px;
  font-weight: 500;
}
</style>
