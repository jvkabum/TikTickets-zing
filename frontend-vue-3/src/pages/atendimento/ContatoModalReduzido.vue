<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card
      style="min-width: 350px"
      class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color"
    >
      <q-card-section>
        <div class="text-h6">Adicionar Contato</div>
        <div class="text-caption text-grey-7">Cadastre o contato recebido no chat.</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="localContact.name"
          label="Nome"
          outlined
          dense
          rounded
        />
        <q-input
          v-model="localContact.number"
          label="Número"
          outlined
          dense
          rounded
        />
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="saveContact"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  contact: { type: Object, default: () => ({ name: '', number: '' }) }
})

const emit = defineEmits(['update:modelValue', 'saveContact'])

const localContact = reactive({
  name: '',
  number: ''
})

watch(
  () => props.contact,
  newVal => {
    if (newVal) {
      localContact.name = newVal.name || ''
      localContact.number = newVal.number || ''
    }
  },
  { immediate: true }
)

const saveContact = () => {
  emit('saveContact', { ...localContact })
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.unified-modal-color {
  background: #1e293b !important;
}

.unified-modal-color :deep(.q-card__section),
.unified-modal-color :deep(.q-table),
.unified-modal-color :deep(.q-table__container),
.unified-modal-color :deep(.q-table__middle),
.unified-modal-color :deep(.q-table__top),
.unified-modal-color :deep(.q-table__bottom),
.unified-modal-color :deep(.q-card__actions) {
  background: transparent !important;
}
</style>
