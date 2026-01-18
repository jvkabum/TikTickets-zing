<template>
  <q-badge
    :color="statusColor"
    :text-color="textColor"
    :label="statusLabel"
    class="status-badge text-bold"
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
    required: true,
    validator: (v) => ['open', 'pending', 'closed', 'group'].includes(v)
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'md'
  }
})

const statusConfig = {
  open: {
    color: 'blue',
    textColor: 'white',
    label: 'Aberto',
    icon: 'mdi-message-processing'
  },
  pending: {
    color: 'orange',
    textColor: 'white',
    label: 'Pendente',
    icon: 'mdi-clock-outline'
  },
  closed: {
    color: 'green',
    textColor: 'white',
    label: 'Fechado',
    icon: 'mdi-check-circle'
  },
  group: {
    color: 'purple',
    textColor: 'white',
    label: 'Grupo',
    icon: 'mdi-account-group'
  }
}

const statusColor = computed(() => statusConfig[props.status]?.color || 'grey')
const textColor = computed(() => statusConfig[props.status]?.textColor || 'white')
const statusLabel = computed(() => statusConfig[props.status]?.label || props.status)
const statusIcon = computed(() => statusConfig[props.status]?.icon || 'mdi-help-circle')
</script>

<style lang="scss" scoped>
.status-badge {
  font-size: 10px;
  padding: 4px 8px;
}
</style>
