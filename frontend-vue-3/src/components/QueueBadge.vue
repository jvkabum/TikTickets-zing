<template>
  <q-badge
    :style="badgeStyle"
    :label="queue.queue || queue.name || queue"
    class="queue-badge"
    :class="{ 'queue-badge--outline': outline }"
  >
    <q-icon
      v-if="showIcon"
      name="mdi-inbox"
      size="14px"
      class="q-mr-xs"
    />
  </q-badge>
</template>

<script setup>

const props = defineProps({
  queue: {
    type: [Object, String],
    required: true
  },
  outline: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: false
  }
})

const badgeStyle = computed(() => {
  const color = typeof props.queue === 'object' ? props.queue.color : '#1976D2'
  
  if (props.outline) {
    return {
      border: `1px solid ${color}`,
      color: color,
      backgroundColor: 'transparent'
    }
  }
  
  return {
    backgroundColor: color,
    color: isLightColor(color) ? '#000' : '#fff'
  }
})

const isLightColor = (color) => {
  if (!color) return false
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
</script>

<style lang="scss" scoped>
.queue-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;

  &--outline {
    background: transparent;
  }
}
</style>
