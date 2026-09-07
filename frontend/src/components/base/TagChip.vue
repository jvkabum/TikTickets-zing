<template>
  <q-chip
    :style="chipStyle"
    :dense="dense"
    :removable="removable"
    :clickable="clickable"
    :outline="outline"
    @remove="$emit('remove')"
    @click="$emit('click')"
  >
    <q-icon
      v-if="showIcon"
      name="mdi-label"
      size="16px"
      class="q-mr-xs"
    />
    {{ tag.tag || tag.name || tag }}
  </q-chip>
</template>

<script setup>

const props = defineProps({
  tag: {
    type: [Object, String],
    required: true
  },
  dense: {
    type: Boolean,
    default: true
  },
  removable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
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

defineEmits(['remove', 'click'])

const chipStyle = computed(() => {
  const color = typeof props.tag === 'object' ? props.tag.color : '#9E9E9E'
  
  if (props.outline) {
    return {
      borderColor: color,
      color: color,
      backgroundColor: 'transparent'
    }
  }
  
  return {
    backgroundColor: color,
    color: isLightColor(color) ? '#000' : '#fff'
  }
})

// Verifica se a cor é clara para ajustar cor do texto
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
