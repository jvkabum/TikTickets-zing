<template>
  <div>
    <q-input
      ref="inputCustomCodar"
      hide-bottom-space
      bottom-slots
      v-bind="$attrs"
      :label="label"
      :class="classAtrrs"
      dense
      outlined
      rounded
      :model-value="modelValue"
      @update:model-value="v => $emit('update:modelValue', v)"
      :error="cError"
      :error-message="cErrorMessage"
    >
      <template
        v-slot:before
        v-if="iconElment.name"
      >
        <q-icon
          :name="iconElment.name"
          :size="iconElment.size"
          :color="iconElment.color"
        />
      </template>

      <!-- Aceitar Demais Slot's -->
      <template
        v-for="(_, slot) in $slots"
        v-slot:[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope || {}"
        />
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: [String, Number, Date],
  label: String,
  classAtrrs: {
    type: String,
    default: () => ''
  },
  error: {
    type: [String, Boolean, Number],
    default: 'NI' // Não Informada
  },
  errorMessage: {
    type: [String, Boolean, Number],
    default: '' // Não Informada
  },
  icon: {
    type: Object,
    default: () => ({})
  },
  hasErrors: Boolean,
  firstErrorMessage: String
})

defineEmits(['update:modelValue'])

const attrs = useAttrs()

const cError = computed(() => {
  if (props.error === 'NI') {
    return props.hasErrors
  }
  return props.error
})

const cErrorMessage = computed(() => {
  if (props.errorMessage === '') {
    return props.firstErrorMessage
  }
  return props.errorMessage
})

const iconElment = computed(() => {
  const defaultConfig = { name: null, size: '24px', color: '#000' }
  const data = { ...defaultConfig, ...props.icon }
  if (!data.name) {
    return defaultConfig
  } else {
    return data
  }
})
</script>

<style scoped></style>
