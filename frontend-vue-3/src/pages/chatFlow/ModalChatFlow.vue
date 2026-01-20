<template>
  <q-dialog
    :model-value="modalChatFlow"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">
          {{ chatFlow.isDuplicate ? 'Duplicar' : chatFlowEdicao.id ? 'Editar' : 'Criar' }}
          Fluxo
          <span v-if="chatFlow.isDuplicate"> (Nome: {{ chatFlowEdicao.name }}) </span>
        </div>
        <div
          v-if="chatFlow.isDuplicate"
          class="text-subtitle1"
        >
          Nome: {{ chatFlowEdicao.name }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          outlined
          rounded
          dense
          v-model="name"
          v-bind="nameProps"
          label="Descrição"
          :error="!!errors.name"
          :error-message="errors.name"
        />
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            rounded
            dense
            outlined
            v-model="celularTeste"
            v-bind="celularTesteProps"
            label="Número para Teste"
            :error="!!errors.celularTeste"
            :error-message="errors.celularTeste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
        </div>
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="isActive"
            v-bind="isActiveProps"
            label="Ativo"
          />
        </div>
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
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow'
import { z } from 'zod'

const props = defineProps({
  modalChatFlow: {
    type: Boolean,
    default: false
  },
  chatFlowEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalChatFlow', 'update:chatFlowEdicao', 'chatFlow:criada', 'chatFlow:editado'])

const chatFlowStore = useChatFlowStore()
const { criarChatFlow, atualizarChatFlow } = chatFlowStore

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

const chatFlow = reactive({
  id: null,
  isDuplicate: false,
  action: 0
})

const abrirModal = () => {
  if (props.chatFlowEdicao.id) {
    chatFlow.id = props.chatFlowEdicao.id
    chatFlow.isDuplicate = !!props.chatFlowEdicao.isDuplicate
    setValues({
      name: props.chatFlowEdicao.name,
      celularTeste: props.chatFlowEdicao.celularTeste,
      isActive: props.chatFlowEdicao.isActive
    })
  } else {
    resetForm()
    chatFlow.id = null
    chatFlow.isDuplicate = false
  }
}

const fecharModal = () => {
  resetForm()
  chatFlow.id = null
  chatFlow.isDuplicate = false
  emit('update:chatFlowEdicao', { id: null })
  emit('update:modalChatFlow', false)
}

const handleAutoresposta = handleSubmit(async values => {
  try {
    if (chatFlow.id && !chatFlow.isDuplicate) {
      const data = await atualizarChatFlow({
        ...values,
        id: chatFlow.id,
        userId,
        action: chatFlow.action
      })
      emit('chatFlow:editado', data)
    } else {
      const flow = {
        ...getDefaultFlow(),
        ...values,
        id: null,
        userId,
        action: chatFlow.action
      }
      const data = await criarChatFlow(flow)
      emit('chatFlow:criada', data)
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style lang="scss" scoped></style>
