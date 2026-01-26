<template>
  <q-dialog
    persistent
    :model-value="modalApi"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="min-width: 80vw; width: 80vw"
      class="q-pa-lg glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color"
    >
      <q-card-section>
        <div class="text-h6">{{ apiEdicao.id ? 'Editar' : 'Criar' }} Configuração API</div>
      </q-card-section>
      <q-card-section>
        <fieldset class="q-pa-md full-width rounded-all">
          <legend class="q-px-sm">Dados API</legend>
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input
                rounded
                dense
                outlined
                v-model="name"
                v-bind="nameProps"
                label="Nome da API"
                :error="!!errors.name"
                :error-message="errors.name"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                rounded
                dense
                outlined
                emit-value
                map-options
                label="Enviar por"
                color="primary"
                v-model="sessionId"
                v-bind="sessionIdProps"
                :options="cSessions"
                :input-debounce="700"
                option-value="id"
                option-label="name"
                :error="!!errors.sessionId"
                :error-message="errors.sessionId"
                input-style="width: 280px; max-width: 280px;"
              />
            </div>
          </div>
        </fieldset>
        <fieldset class="q-pa-md full-width q-mt-lg rounded-all">
          <legend class="q-px-sm">WebHook</legend>
          <div class="row q-col-gutter-md">
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="urlServiceStatus"
                v-bind="urlServiceStatusProps"
                :error="!!errors.urlServiceStatus"
                :error-message="errors.urlServiceStatus"
                label="URL WebHook Status Sessão"
                hint="Dispara a ação sempre que o status da sessão conectada ao whatsapp é alterado."
              />
            </div>
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="urlMessageStatus"
                v-bind="urlMessageStatusProps"
                :error="!!errors.urlMessageStatus"
                :error-message="errors.urlMessageStatus"
                label="URL WebHook Status Mensagem"
                hint="Dispara ação sempre que o status de uma mensagem é atualizado."
              />
            </div>
            <div class="col-12 q-mt-md">
              <q-input
                rounded
                dense
                outlined
                v-model="authToken"
                v-bind="authTokenProps"
                :error="!!errors.authToken"
                :error-message="errors.authToken"
                label="Token de autenticação"
                hint="Será enviado como authorization no header. Se existir prefixo, deverá ser informado aqui. Ex.: Bearer, Token"
              />
            </div>
          </div>
        </fieldset>

        <q-checkbox
          v-if="api.id"
          v-model="api.isActive"
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
          @click="handleAPI"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { storeToRefs } from 'pinia'
import { useApiStore } from 'src/stores/useApiStore'
import { useWhatsappStore } from 'src/stores/useWhatsappStore'
import { useForm } from 'vee-validate'
import { computed, reactive, ref } from 'vue'
import { z } from 'zod'
// Checking task, useWhatsappStore exists. Let's try to use it if populated.
// But wait, the component uses store.getters.whatsapps. I should check if useWhatsappStore has this data.
// For safety in this migration step, I'll keep legacy store access for whatsapps only, as the user didn't ask to migrate whatsapp handling yet.
// Actually, task.md says "SessaoWhatsapp" is later. I will check if I can use legacy store. Yes.

const props = defineProps({
  modalApi: {
    type: Boolean,
    default: false
  },
  apiEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalApi', 'update:apiEdicao', 'modal-api:criada', 'modal-api:editada'])

const whatsappStore = useWhatsappStore()
const { whatsapps } = storeToRefs(whatsappStore)
const apiStore = useApiStore()
const { criarAPI, editarAPI } = apiStore

const loading = ref(false)

const validationSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    sessionId: z.union([z.number(), z.string()]).refine(val => val !== null && val !== '', 'Sessão é obrigatória'),
    urlServiceStatus: z.string().url('URL inválida').optional().or(z.literal('')),
    urlMessageStatus: z.string().url('URL inválida').optional().or(z.literal('')),
    authToken: z.string().optional()
  })
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    sessionId: null,
    urlServiceStatus: '',
    urlMessageStatus: '',
    authToken: ''
  }
})

const [name, nameProps] = defineField('name')
const [sessionId, sessionIdProps] = defineField('sessionId')
const [urlServiceStatus, urlServiceStatusProps] = defineField('urlServiceStatus')
const [urlMessageStatus, urlMessageStatusProps] = defineField('urlMessageStatus')
const [authToken, authTokenProps] = defineField('authToken')

const api = reactive({
  id: null,
  isActive: true
})

const cSessions = computed(() => {
  return whatsapps.value?.filter(w => w.type === 'whatsapp' && !w.isDeleted) || []
})

const resetarApi = () => {
  resetForm()
  api.id = null
  api.isActive = true
}

const fecharModal = () => {
  resetarApi()
  emit('update:apiEdicao', { id: null })
  emit('update:modalApi', false)
}

const abrirModal = () => {
  if (props.apiEdicao.id) {
    api.id = props.apiEdicao.id
    api.isActive = props.apiEdicao.isActive
    setValues({
      name: props.apiEdicao.name,
      sessionId: props.apiEdicao.sessionId,
      urlServiceStatus: props.apiEdicao.urlServiceStatus || '',
      urlMessageStatus: props.apiEdicao.urlMessageStatus || '',
      authToken: props.apiEdicao.authToken || ''
    })
  } else {
    resetarApi()
  }
}

const handleAPI = handleSubmit(async values => {
  const apiData = {
    ...values,
    id: api.id,
    isActive: api.isActive
  }

  loading.value = true
  try {
    if (api.id) {
      const data = await editarAPI(apiData)
      emit('modal-api:editada', data)
    } else {
      const data = await criarAPI(apiData)
      emit('modal-api:criada', data)
    }
    fecharModal()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
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
