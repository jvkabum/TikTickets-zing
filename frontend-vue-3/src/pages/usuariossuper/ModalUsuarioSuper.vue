<template>
  <q-dialog
    persistent
    :model-value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 600px" class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color">
      <q-card-section>
        <div class="text-h6">Cadastrar Usuário</div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-select
              outlined
              rounded
              dense
              v-model="tenantId"
              :options="tenantOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Empresa"
              :error="!!errors.tenantId"
              :error-message="errors.tenantId"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input
              outlined
              v-model="name"
              label="Nome"
              :error="!!errors.name"
              :error-message="errors.name"
            />
          </div>
          <div class="col-12">
            <q-input
              outlined
              v-model="email"
              label="E-mail"
              :error="!!errors.email"
              :error-message="errors.email"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input
              outlined
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              label="Senha"
              :error="!!errors.password"
              :error-message="errors.password"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-select
              :disable="isProfile"
              outlined
              rounded
              dense
              v-model="profile"
              :options="optionsProfile"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Perfil"
              :error="!!errors.profile"
              :error-message="errors.profile"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          rounded
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          v-close-popup
        />
        <q-btn
          rounded
          label="Salvar"
          class="q-px-md"
          color="primary"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'

const props = defineProps({
// ... rest of file
  modalUsuario: {
    type: Boolean,
    default: false
  },
  isProfile: {
    type: Boolean,
    default: false
  },
  usuarioEdicao: {
    type: Object,
    default: () => ({ id: null })
  }
})

const emit = defineEmits([
  'update:modalUsuario',
  'update:usuarioEdicao',
  'modalUsuario:usuario-editado',
  'modalUsuario:usuario-criado'
])

const $q = useQuasar()
const tenantStore = useTenantStore()
const usuarioStore = useUsuarioStore()

const isPwd = ref(true)
const optionsProfile = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuário' }
]

const tenantOptions = computed(() => tenantStore.tenants.map(t => ({ label: t.name, value: t.id })))

const validationSchema = toTypedSchema(
  zod.object({
    tenantId: zod.number({ required_error: 'Selecione uma empresa' }),
    name: zod.string().min(3, 'Mínimo de 3 caracteres').max(50, 'Máximo de 50 caracteres'),
    email: zod.string().email('E-mail inválido'),
    profile: zod.string(),
    password: zod.string().min(6, 'Mínimo de 6 caracteres').max(50, 'Máximo de 50 caracteres')
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    tenantId: '',
    name: '',
    email: '',
    password: '',
    profile: 'user'
  }
})

const { value: tenantId } = useField('tenantId')
const { value: name } = useField('name')
const { value: email } = useField('email')
const { value: password } = useField('password')
const { value: profile } = useField('profile')

const abrirModal = async () => {
  if (tenantStore.tenants.length === 0) {
    await tenantStore.listarTenants()
  }

  if (props.usuarioEdicao.id) {
    setValues({
      tenantId: props.usuarioEdicao.tenantId,
      name: props.usuarioEdicao.name,
      email: props.usuarioEdicao.email,
      profile: props.usuarioEdicao.profile,
      password: ''
    })
  } else if (props.usuarioEdicao.userId) {
    setValues({
      tenantId: props.usuarioEdicao.tenantId,
      name: props.usuarioEdicao.username || props.usuarioEdicao.name,
      email: props.usuarioEdicao.email,
      profile: props.usuarioEdicao.profile,
      password: ''
    })
  } else {
    resetForm()
  }
}

const fecharModal = () => {
  if (!props.isProfile) {
    emit('update:usuarioEdicao', {})
  }
  emit('update:modalUsuario', false)
  resetForm()
  isPwd.value = true
}

const onSubmit = handleSubmit(async values => {
  try {
    if (props.usuarioEdicao.id || props.usuarioEdicao.userId) {
      // No original ele emitia um evento, mas usuários super parecem ser criados via CriarUsuarioTenant
      // e editados via outra lógica. Vou manter a consistência com o original.
      const payload = {
        ...values,
        id: props.usuarioEdicao.id || props.usuarioEdicao.userId
      }
      emit('modalUsuario:usuario-editado', payload)
      $q.notify({
        type: 'info',
        message: 'Usuário editado!',
        position: 'top'
      })
    } else {
      const res = await usuarioStore.criarUsuarioTenant(values)
      emit('modalUsuario:usuario-criado', res)
      $q.notify({
        type: 'positive',
        message: 'Usuário criado!',
        position: 'top'
      })
    }
    emit('update:modalUsuario', false)
  } catch (error) {
    console.error(error)
    const err = error.data?.error
    if (err === 'ERR_USER_LIMIT_USER_CREATION') {
      $q.notify({
        type: 'negative',
        message: 'Limite de usuário atingido.',
        position: 'top'
      })
    } else if (err === 'ERR_EMAIL_ALREADY_REGISTERED') {
      $q.notify({
        type: 'negative',
        message: 'Este e-mail já está cadastrado.',
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível salvar o usuário.',
        position: 'top'
      })
    }
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
