<template>
  <q-dialog
    persistent
    :model-value="modalTenant"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ tenantEdicao.id ? 'Editar' : 'Criar' }} Tenant</div>
      </q-card-section>
      <q-card-section>
        <q-toggle
          v-model="toggleStatus"
          :label="toggleStatus ? 'Ativo' : 'Inativo'"
          color="primary"
          class="q-mb-md"
        />
        <q-input
          class="row col q-mb-sm"
          square
          outlined
          v-model="name"
          label="Nome"
          :error="!!errors.name"
          :error-message="errors.name"
        />
        <q-input
          class="row col q-mb-sm"
          square
          outlined
          type="number"
          v-model="maxUsers"
          label="Usuários"
          :error="!!errors.maxUsers"
          :error-message="errors.maxUsers"
        />
        <q-input
          class="row col q-mb-sm"
          square
          outlined
          type="number"
          v-model="maxConnections"
          label="Conexões"
          :error="!!errors.maxConnections"
          :error-message="errors.maxConnections"
        />
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
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useTenantStore } from 'src/stores/useTenantStore'
import { useField, useForm } from 'vee-validate'
import * as zod from 'zod'

const props = defineProps({
  modalTenant: {
    type: Boolean,
    default: false
  },
  tenantEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits(['update:modalTenant', 'update:tenantEdicao', 'modal-tenant:criada', 'modal-tenant:editada'])

const $q = useQuasar()
const tenantStore = useTenantStore()

const toggleStatus = ref(true)

const validationSchema = toTypedSchema(
  zod.object({
    name: zod.string().min(3, 'Mínimo de 3 caracteres').max(100, 'Máximo de 100 caracteres'),
    maxUsers: zod.number({ invalid_type_error: 'Informe um número' }).min(1, 'Mínimo de 1'),
    maxConnections: zod.number({ invalid_type_error: 'Informe um número' }).min(1, 'Mínimo de 1'),
    status: zod.string()
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    maxUsers: 1,
    maxConnections: 1,
    status: 'active'
  }
})

const { value: name } = useField('name')
const { value: maxUsers } = useField('maxUsers')
const { value: maxConnections } = useField('maxConnections')
const { value: status } = useField('status')

watch(toggleStatus, val => {
  status.value = val ? 'active' : 'inactive'
})

const abrirModal = () => {
  if (props.tenantEdicao.id) {
    setValues({
      name: props.tenantEdicao.name,
      maxUsers: Number(props.tenantEdicao.maxUsers),
      maxConnections: Number(props.tenantEdicao.maxConnections),
      status: props.tenantEdicao.status
    })
    toggleStatus.value = props.tenantEdicao.status === 'active'
  } else {
    resetForm()
    toggleStatus.value = true
    status.value = 'active'
  }
}

const fecharModal = () => {
  emit('update:tenantEdicao', { id: null })
  emit('update:modalTenant', false)
  resetForm()
}

const onSubmit = handleSubmit(async values => {
  try {
    if (props.tenantEdicao.id) {
      const payload = { ...values, id: props.tenantEdicao.id }
      const data = await tenantStore.atualizarTenant(payload)
      emit('modal-tenant:editada', data)
      $q.notify({
        type: 'info',
        message: 'Empresa editada!',
        position: 'top'
      })
    } else {
      const data = await tenantStore.criarTenant(values)
      emit('modal-tenant:criada', data)
      $q.notify({
        type: 'positive',
        message: 'Empresa criada!',
        position: 'top'
      })
    }
    fecharModal()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro ao salvar a Empresa',
      position: 'top'
    })
  }
})
</script>

<style lang="scss" scoped></style>
