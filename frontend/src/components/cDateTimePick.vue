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
      :modelValue="cDisplayValue"
      @update:modelValue="handleInput"
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
              :modelValue="cQDate"
              today-btn
              mask="DD/MM/YYYY HH:mm"
              @update:modelValue="emitDate"
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
              :modelValue="cQDate"
              @update:modelValue="emitDate"
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
<script>
import { format, parse, isValid, parseISO } from 'date-fns'

export default {
  name: 'cDateTimePick',
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
    cDisplayValue () {
      if (!this.modelValue) return ''
      try {
        const date = typeof this.modelValue === 'string' ? (this.modelValue.includes('T') ? parseISO(this.modelValue) : parse(this.modelValue, 'yyyy-MM-dd HH:mm', new Date())) : this.modelValue
        if (isValid(date)) {
          return format(date, 'dd/MM/yyyy HH:mm')
        }
      } catch (e) {
         // silent
      }
      return ''
    },
    cQDate () {
      return this.cDisplayValue || format(new Date(), 'dd/MM/yyyy HH:mm')
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
    handleInput (val) {
      if (!val || val.includes('_')) return
      try {
        const date = parse(val, 'dd/MM/yyyy HH:mm', new Date())
        if (isValid(date)) {
          this.$emit('update:modelValue', format(date, 'yyyy-MM-dd HH:mm'))
        }
      } catch (e) {
        // silent
      }
    },
    emitDate (value) {
      if (!value) return
      const parseDate = parse(value, 'DD/MM/YYYY HH:mm', new Date())
      this.$emit('update:modelValue', format(parseDate, 'yyyy-MM-dd HH:mm'))
      // ref hide logic might be different or unnecessary if v-close-popup is used, but keeping for now
    }
  }
}
</script>

<style scoped>
</style>
