<template>
  <q-dialog
    persistent
    :model-value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ usuario.id ? 'Editar' : 'Cadastrar' }} Usuário</div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
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
const usuarioStore = useUsuarioStore()
const authStore = useAuthStore()

const isPwd = ref(true)
const optionsProfile = [
  { value: 'user', label: 'Usuário' },
  { value: 'admin', label: 'Administrador' }
]

const usuario = reactive({
  id: null
})

const validationSchema = toTypedSchema(
  zod
    .object({
      name: zod.string().min(3, 'Mínimo de 3 caracteres').max(50, 'Máximo de 50 caracteres'),
      email: zod.string().email('E-mail inválido'),
      profile: zod.string(),
      password: zod
        .string()
        .min(6, 'Mínimo de 6 caracteres')
        .max(50, 'Máximo de 50 caracteres')
        .optional()
        .or(zod.literal(''))
    })
    .refine(
      data => {
        if (!usuario.id && (!data.password || data.password.length < 6)) {
          return false
        }
        return true
      },
      {
        message: 'Senha obrigatória para novo usuário (mínimo 6 caracteres)',
        path: ['password']
      }
    )
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: {
    name: '',
    email: '',
    password: '',
    profile: 'user'
  }
})

const { value: name } = useField('name')
const { value: email } = useField('email')
const { value: password } = useField('password')
const { value: profile } = useField('profile')

const abrirModal = () => {
  if (props.usuarioEdicao.id) {
    usuario.id = props.usuarioEdicao.id
    setValues({
      name: props.usuarioEdicao.name,
      email: props.usuarioEdicao.email,
      profile: props.usuarioEdicao.profile,
      password: ''
    })
  } else if (props.usuarioEdicao.userId) {
    // Legado ou caso específico
    usuario.id = props.usuarioEdicao.userId
    setValues({
      name: props.usuarioEdicao.username || props.usuarioEdicao.name,
      email: props.usuarioEdicao.email,
      profile: props.usuarioEdicao.profile,
      password: ''
    })
  } else {
    usuario.id = null
    resetForm()
  }
}

const fecharModal = () => {
  if (!props.isProfile) {
    emit('update:usuarioEdicao', { id: null })
  }
  emit('update:modalUsuario', false)
  resetForm()
  isPwd.value = true
}

const onSubmit = handleSubmit(async values => {
  try {
    if (usuario.id) {
      const payload = { ...values }
      if (!payload.password) delete payload.password

      const data = await usuarioStore.updateUsuarios(usuario.id, payload)
      emit('modalUsuario:usuario-editado', data)
      $q.notify({
        type: 'info',
        message: 'Usuário editado!',
        position: 'top'
      })
    } else {
      const data = await usuarioStore.criarUsuario(values)
      emit('modalUsuario:usuario-criado', data)
      $q.notify({
        type: 'positive',
        message: 'Usuário criado!',
        position: 'top'
      })
    }
    emit('update:modalUsuario', false)
  } catch (error) {
    console.error(error)
    if (error.data?.error === 'ERR_USER_LIMIT_USER_CREATION') {
      $q.notify({
        type: 'negative',
        message: 'Limite de usuário atingido.',
        caption: 'ERR_USER_LIMIT_USER_CREATION',
        position: 'top'
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
