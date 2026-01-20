<template>
  <div>
    <q-input
      class="full-width"
      hide-bottom-space
      outlined
      stack-label
      type="text"
      mask="##/##/#### ##:##"
      fill-mask
      bottom-slots
      v-bind="$attrs"
      :class="classAtrrs"
      :model-value="cDisplayValue"
      @update:model-value="handleInput"
      :error="cError"
      :error-message="cErrorMessage"
    >
      <template v-slot:prepend>
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
              mask="DD/MM/YYYY HH:mm"
              @update:model-value="emitDate"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
      <template v-slot:append>
        <q-icon
          name="access_time"
          class="cursor-pointer"
        >
          <q-popup-proxy
            ref="qTimeProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-time
              :model-value="cQDate"
              @update:model-value="emitDate"
              mask="DD/MM/YYYY HH:mm"
              format24h
            >
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  label="Close"
                  color="primary"
                  flat
                />
              </div>
            </q-time>
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

const cDisplayValue = computed(() => {
  if (!props.modelValue) return ''
  try {
    const date =
      typeof props.modelValue === 'string'
        ? props.modelValue.includes('T')
          ? parseISO(props.modelValue)
          : parse(props.modelValue, 'yyyy-MM-dd HH:mm', new Date())
        : props.modelValue
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy HH:mm')
    }
  } catch (e) {
    // silent
  }
  return ''
})

const cQDate = computed(() => {
  return cDisplayValue.value || format(new Date(), 'dd/MM/yyyy HH:mm')
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

const handleInput = val => {
  if (!val || val.includes('_')) return
  try {
    const date = parse(val, 'dd/MM/yyyy HH:mm', new Date())
    if (isValid(date)) {
      emit('update:modelValue', format(date, 'yyyy-MM-dd HH:mm'))
    }
  } catch (e) {
    // silent
  }
}

const emitDate = value => {
  if (!value) return
  const parseDate = parse(value, 'dd/MM/yyyy HH:mm', new Date())
  emit('update:modelValue', format(parseDate, 'yyyy-MM-dd HH:mm'))
}
</script>

<style scoped></style>
