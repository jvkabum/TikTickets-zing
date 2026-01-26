<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    position="top"
  >
    <q-card style="width: 400px" class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color">
      <q-card-section class="row items-center">
        <div class="text-h6">Selecione o arquivo</div>
      </q-card-section>
      <q-card-section>
        <q-file
          outlined
          dense
          rounded
          use-chips
          accept=".csv"
          v-model="file"
          label="Arquivo de contatos"
          hint="Colunas: Nome; Numero"
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
      </q-card-section>
      <q-card-section class="row q-gutter-sm">
        <div class="col-12">
          <q-select
            class="full-width"
            outlined
            dense
            rounded
            v-model="tags"
            multiple
            label="Etiquetas"
            :options="etiquetas"
            use-chips
            option-value="id"
            option-label="tag"
            emit-value
            map-options
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item
                v-bind="itemProps"
                v-on="itemEvents"
              >
                <q-item-section>
                  <q-item-label><span v-html="opt.tag"></span></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    :model-value="selected"
                    @update:model-value="toggleOption(opt)"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          rounded
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md"
        />
        <q-btn
          class="q-ml-lg q-px-md"
          rounded
          label="Importar"
          color="positive"
          @click="handleImportar"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  etiquetas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'imported'])

const contatoStore = useContatoStore()

const file = ref(null)
const tags = ref([])
const loading = ref(false)

const handleImportar = async () => {
  if (!file.value) return

  loading.value = true
  const formData = new FormData()
  formData.append('file', file.value)
  if (tags.value.length > 0) {
    formData.append('tagsIds', JSON.stringify(tags.value))
  }

  try {
    await contatoStore.importarContatos(formData)
    notificarSucesso('Contatos importados com sucesso!')
    emit('update:modelValue', false)
    emit('imported')
    file.value = null
    tags.value = []
  } catch (error) {
    notificarErro('Erro ao importar contatos', error)
  } finally {
    loading.value = false
  }
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
