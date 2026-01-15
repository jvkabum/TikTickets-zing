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
      :modelValue="modelValue"
      @update:modelValue="v => $emit('update:modelValue', v)"
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
<script>
export default {
  name: 'cInput',
  inheritAttrs: false,
  props: {
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
      default: () => { }
    },
    // Removendo dependência do extractor, passamos as propriedades manualmente do vuelidate se necessário
    hasErrors: Boolean,
    firstErrorMessage: String
  },
  emits: ['update:modelValue'],
  computed: {
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
    },
    iconElment () {
      const defaultConfig = { name: null, size: '24px', color: '#000' }
      const data = { ...defaultConfig, ...this.icon }
      if (!data.name) {
        return defaultConfig
      } else {
        return data
      }
    }
  }
}
</script>

<style scoped>
</style>
