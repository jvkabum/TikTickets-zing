<template>
  <q-dialog
    :value="modalAutoResposta"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ autoRespostaEdicao.id ? 'Editar' : 'Criar' }} Auto Resposta</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="name"
          v-bind="nameProps"
          label="Descrição"
          :error="!!errors.name"
          :error-message="errors.name"
        />
        <!-- <div class="row col q-mt-md">
          <q-option-group
            v-model="autoResposta.action"
            :options="options"
            color="primary"
          />
        </div> -->
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="isActive"
            v-bind="isActiveProps"
            label="Ativo"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            square
            outlined
            v-model="celularTeste"
            v-bind="celularTesteProps"
            label="Número para Teste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useAutoRespostaStore } from 'src/stores/useAutoRespostaStore'
import { useForm } from 'vee-validate'
import { reactive } from 'vue'
import { z } from 'zod'

const props = defineProps({
  modalAutoResposta: {
    type: Boolean,
    default: false
  },
  autoRespostaEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalAutoResposta', 'update:autoRespostaEdicao'])

const autoRespostaStore = useAutoRespostaStore()
const { criarAutoResposta, editarAutoResposta } = autoRespostaStore

const userId = +localStorage.getItem('userId')

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Descrição é obrigatória'),
    celularTeste: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    celularTeste: '',
    isActive: true
  }
})

const [name, nameProps] = defineField('name')
const [celularTeste, celularTesteProps] = defineField('celularTeste')
const [isActive, isActiveProps] = defineField('isActive')

const autoResposta = reactive({
  id: null,
  action: 0,
  userId
})

const fecharModal = () => {
  resetForm()
  autoResposta.id = null
  emit('update:autoRespostaEdicao', { id: null })
  emit('update:modalAutoResposta', false)
}

const abrirModal = () => {
  if (props.autoRespostaEdicao.id) {
    autoResposta.id = props.autoRespostaEdicao.id
    setValues({
      name: props.autoRespostaEdicao.name,
      celularTeste: props.autoRespostaEdicao.celularTeste,
      isActive: props.autoRespostaEdicao.isActive
    })
  } else {
    resetForm()
    autoResposta.id = null
    autoResposta.userId = userId
  }
}

const handleAutoresposta = handleSubmit(async values => {
  const dataToSave = {
    ...values,
    id: autoResposta.id,
    userId: autoResposta.userId,
    action: autoResposta.action
  }

  try {
    if (autoResposta.id) {
      await editarAutoResposta(dataToSave)
    } else {
      await criarAutoResposta(dataToSave)
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style lang="scss" scoped></style>
