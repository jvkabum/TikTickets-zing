<template>
  <q-dialog
    persistent
    :model-value="modalFila"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <div class="text-h6">{{ filaEdicao.id ? 'Editar' : 'Criar' }} Fila</div>
      <q-card-section>
        <q-input
          class="row col"
          rounded
          outlined
          dense
          v-model="queue"
          v-bind="queueProps"
          label="Nome da Fila"
          :error="!!errors.queue"
          :error-message="errors.queue"
        />
        <q-checkbox
          v-model="isActive"
          v-bind="isActiveProps"
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
          @click="handleFila"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useFilaStore } from 'src/stores/useFilaStore'
import { notificarErro } from 'src/utils/helpersNotifications'
import { useForm } from 'vee-validate'
import { reactive, ref } from 'vue'
import { z } from 'zod'

const props = defineProps({
  modalFila: {
    type: Boolean,
    default: false
  },
  filaEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalFila', 'update:filaEdicao', 'modal-fila:criada', 'modal-fila:editada'])

const $q = useQuasar()
const filaStore = useFilaStore()
const { criarFila, alterarFila } = filaStore

const loading = ref(false)

const validationSchema = toTypedSchema(
  z.object({
    queue: z.string().min(1, 'Obrigatório'),
    isActive: z.boolean()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    queue: '',
    isActive: true
  }
})

const [queue, queueProps] = defineField('queue')
const [isActive, isActiveProps] = defineField('isActive')

const filaState = reactive({
  id: null
})

const resetarFila = () => {
  resetForm()
  filaState.id = null
  setValues({
    queue: '',
    isActive: true
  })
}

const abrirModal = () => {
  if (props.filaEdicao.id) {
    filaState.id = props.filaEdicao.id
    setValues({
      queue: props.filaEdicao.queue,
      isActive: props.filaEdicao.isActive
    })
  } else {
    resetarFila()
  }
}

const fecharModal = () => {
  resetarFila()
  emit('update:filaEdicao', { id: null })
  emit('update:modalFila', false)
}

const handleFila = handleSubmit(async values => {
  loading.value = true
  try {
    const filaData = {
      ...values,
      id: filaState.id
    }

    if (filaData.id) {
      const data = await alterarFila(filaData)
      emit('modal-fila:editada', data)
      $q.notify({
        type: 'info',
        message: 'Fila editada!',
        position: 'top'
      })
    } else {
      const data = await criarFila(filaData)
      emit('modal-fila:criada', data)
      $q.notify({
        type: 'positive',
        message: 'Fila criada!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
    notificarErro('Ocorreu um erro!', error)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped></style>
