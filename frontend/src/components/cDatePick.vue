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
      :modelValue="modelValue"
      @update:modelValue="v => $emit('update:modelValue', v)"
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
              :modelValue="cQDate"
              today-btn
              mask="DD/MM/YYYY"
              @update:modelValue="emitDate"
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
<script>
import { format, parse, isValid, parseISO } from 'date-fns'

export default {
  name: 'cDatePick',
  inheritAttrs: false,
  props: {
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
  },
  emits: ['update:modelValue'],
  computed: {
    cQDate () {
      if (!this.modelValue) return format(new Date(), 'dd/MM/yyyy')
      try {
        const date = typeof this.modelValue === 'string' ? parseISO(this.modelValue) : this.modelValue
        if (isValid(date)) {
          return format(date, 'dd/MM/yyyy')
        }
      } catch (e) {
        // Fallback
      }
      return format(new Date(), 'dd/MM/yyyy')
    },
    cError () {
      if (this.error === 'NI') {
        return this.hasErrors
      }
      return this.error
    },
    cErrorMessage () {
      if (this.errorMessage === '') {
        return this.firstErrorMessage
      }
      return this.errorMessage
    }
  },
  methods: {
    emitDate (value) {
      if (!value) return
      const parseDate = parse(value, 'dd/MM/yyyy', new Date())
      this.$emit('update:modelValue', format(parseDate, 'yyyy-MM-dd'))
      this.$refs.qDateProxy.hide()
    }
  }
}
</script>

<style scoped>
</style>
