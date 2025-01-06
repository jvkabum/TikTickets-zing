<template>
  <q-dialog
    persistent
    :value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 600px">
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
              v-model="usuario.tenantId"
              :options="filteredTenants"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Empresa"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="$v.usuario.name"
              @blur="$v.usuario.name.$touch"
              label="Nome"
            />
          </div>
          <div class="col-12">
            <c-input
              outlined
              :validator="$v.usuario.email"
              @blur="$v.usuario.email.$touch"
              v-model.trim="usuario.email"
              label="E-mail"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <c-input
              outlined
              v-model="usuario.password"
              :validator="$v.usuario.password"
              @blur="$v.usuario.password.$touch"
              :type="isPwd ? 'password' : 'text'"
              label="Senha"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </c-input>
          </div>
          <div class="col-12">
            <q-select
              :disable="isProfile"
              outlined
              rounded
              dense
              v-model="usuario.profile"
              :options="optionsProfile"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Perfil"
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
          @click="handleUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { CriarUsuarioTenant } from 'src/service/user'
import { AdminListarEmpresas } from 'src/service/empresas'
export default {
  name: 'ModalUsuario',
  props: {
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
      default: () => { return { id: null } }
    }
  },
  data () {
    return {
      tenants: [],
      isPwd: false,
      optionsProfile: [
        { value: 'admin', label: 'Administrador' },
        { value: 'user', label: 'Usuário' }
      ],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: 'user',
        tenantId: ''
      }
    }
  },
  validations () {
    let usuario = {
      tenantId: { required },
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { required, email },
      profile: { required },
      password: {}
    }
    if (!this.usuario.id) {
      usuario = {
        ...usuario,
        password: { required, minLength: minLength(6), maxLength: maxLength(50) }
      }
    }
    return { usuario }
  },
  created () {
    this.AdminListarEmpresas()
  },
  computed: {
    filteredTenants () {
      return this.tenants
        .map(tenant => ({ label: tenant.name, value: tenant.id }))
    }
  },
  methods: {
    async AdminListarEmpresas () {
      const { data } = await AdminListarEmpresas()
      this.tenants = data
    },
    abrirModal () {
      if (this.usuarioEdicao.id) {
        this.usuario = { ...this.usuarioEdicao }
      }
      if (this.usuarioEdicao.userId) {
        this.usuario = {
          ...this.usuarioEdicao,
          id: this.usuarioEdicao.userId,
          name: this.usuarioEdicao.username,
          profile: this.usuarioEdicao.profile,
          tenantId: this.usuarioEdicao.tenantId
        }
      }
    },
    fecharModal () {
      if (!this.isProfile) {
        this.$emit('update:usuarioEdicao', {})
      }
      this.$emit('update:modalUsuario', false)
      this.usuario = {
        name: '',
        email: '',
        password: '',
        profile: 'user',
        tenantId: ''
      }
      this.isPwd = false
      this.$v.usuario.$reset()
    },
    async handleUsuario () {
      this.$v.usuario.$touch()
      if (this.$v.usuario.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      try {
        if (this.usuario.id) {
          const {
            email, id, name, tenantId, password, profile
          } = this.usuario

          const params = { email, id, name, tenantId, password, profile }

          if (this.$store.state.user.isAdmin) {
            params.profile = this.usuario.profile
          }

          this.$emit('modalUsuario:usuario-editado', params)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Usuário editado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarUsuarioTenant(this.usuario)
          this.$emit('modalUsuario:usuario-criado', data)
          // Emita um evento global informando que um novo usuário foi criado
          this.$root.$emit('usuario-criado', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Usuário criado!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.$emit('update:modalUsuario', false)
      } catch (error) {
        console.error(error)
        if (error.data.error === 'ERR_USER_LIMIT_USER_CREATION') {
          this.$q.notify({
            type: 'negative',
            message: 'Limite de usuario atingido.',
            caption: 'ERR_USER_LIMIT_USER_CREATION',
            position: 'top',
            progress: true
          })
        } else if (error.data.error === 'ERR_EMAIL_ALREADY_REGISTERED') {
          this.$q.notify({
            type: 'negative',
            message: 'Este e-mail já está cadastrado.',
            caption: 'ERR_EMAIL_ALREADY_REGISTERED',
            position: 'top',
            progress: true
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Não foi possível criar o usuário.',
            caption: 'ERR_UNKNOWN_ERROR',
            position: 'top',
            progress: true
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
