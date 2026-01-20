<template>
  <q-dialog
    persistent
    :model-value="modalEtiqueta"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ etiquetaEdicao.id ? 'Editar' : 'Criar' }} Etiqueta</div>
      <q-card-section>
        <q-input
          class="row col"
          rounded
          dense
          outlined
          v-model="etiqueta.tag"
          label="Nome da Etiqueta"
        />
        <q-input
          class="row col"
          rounded
          dense
          outlined
          v-model="etiqueta.autoTag"
          label="Auto Tag"
        />
        <q-input
          rounded
          outlined
          dense
          hide-bottom-space
          :style="`background: ${etiqueta.color}; border-radius: 20px `"
          v-model="etiqueta.color"
          :rules="['anyColor']"
          class="q-my-md"
          :dark="false"
        >
          <template v-slot:preappend> </template>
          <template v-slot:append>
            <q-icon
              name="colorize"
              class="cursor-pointer"
            >
              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color
                  format-model="hex"
                  square
                  default-view="palette"
                  no-header
                  bordered
                  v-model="etiqueta.color"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-checkbox
          v-model="etiqueta.isActive"
          label="Ativo"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          rounded
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          rounded
          label="Salvar"
          color="positive"
          @click="handleEtiqueta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useEtiquetaStore } from 'src/stores/useEtiquetaStore'
import { notificarErro } from 'src/utils/helpersNotifications'
import { reactive, ref } from 'vue'

const props = defineProps({
  modalEtiqueta: {
    type: Boolean,
    default: false
  },
  etiquetaEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits([
  'update:modalEtiqueta',
  'update:etiquetaEdicao',
  'modal-etiqueta:criada',
  'modal-etiqueta:editada'
])

const $q = useQuasar()
const store = useEtiquetaStore()
const loading = ref(false)

const etiqueta = reactive({
  id: null,
  tag: null,
  color: '#ffffff',
  isActive: true,
  autoTag: ''
})

const resetarEtiqueta = () => {
  Object.assign(etiqueta, {
    id: null,
    tag: null,
    color: '#ffffff',
    isActive: true,
    autoTag: ''
  })
}

const fecharModal = () => {
  resetarEtiqueta()
  emit('update:etiquetaEdicao', { id: null })
  emit('update:modalEtiqueta', false)
}

const abrirModal = () => {
  if (props.etiquetaEdicao.id) {
    Object.assign(etiqueta, props.etiquetaEdicao)
  } else {
    resetarEtiqueta()
  }
}

const handleEtiqueta = async () => {
  try {
    loading.value = true
    if (etiqueta.id) {
      const data = await store.alterarEtiqueta(etiqueta)
      emit('modal-etiqueta:editada', data)
      $q.notify({
        type: 'info',
        progress: true,
        position: 'top',
        textColor: 'black',
        message: 'Etiqueta editada!',
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white'
          }
        ]
      })
    } else {
      const data = await store.criarEtiqueta(etiqueta)
      emit('modal-etiqueta:criada', data)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: 'Etiqueta criada!',
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white'
          }
        ]
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
    notificarErro('Ocorreu um erro ao processar a etiqueta', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
