<template>
  <div>
    <q-input
      class="full-width"
      hide-bottom-space
      outlined
      stack-label
      type="date"
      bottom-slots
      v-bind="$attrs"
      :class="classAtrrs"
      :model-value="modelValue"
      @update:model-value="v => $emit('update:modelValue', v)"
      :error="cError"
      :error-message="cErrorMessage"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer q-mr-sm"
        >
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              :model-value="cQDate"
              today-btn
              mask="DD/MM/YYYY"
              @update:model-value="emitDate"
            />
          </q-popup-proxy>
        </q-icon>
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

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: [String, Date],
  error: {
    type: [String, Boolean, Number],
    default: 'NI' // Não Informada
  },
  errorMessage: {
    type: [String, Boolean, Number],
    default: '' // Não Informada
  },
  classAtrrs: {
    type: String,
    default: () => ''
  },
  hasErrors: Boolean,
  firstErrorMessage: String
})

const emit = defineEmits(['update:modelValue'])

const qDateProxy = ref(null)

const cQDate = computed(() => {
  if (!props.modelValue) return format(new Date(), 'dd/MM/yyyy')
  try {
    const date = typeof props.modelValue === 'string' ? parseISO(props.modelValue) : props.modelValue
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy')
    }
  } catch (e) {
    // Fallback
  }
  return format(new Date(), 'dd/MM/yyyy')
})

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

const emitDate = value => {
  if (!value) return
  const parseDate = parse(value, 'dd/MM/yyyy', new Date())
  emit('update:modelValue', format(parseDate, 'yyyy-MM-dd'))
  qDateProxy.value.hide()
}
</script>

<style scoped></style>
