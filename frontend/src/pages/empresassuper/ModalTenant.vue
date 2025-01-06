<template>
  <q-dialog
    persistent
    :value="modalTenant"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ tenantEdicao.id ? 'Editar': 'Criar' }} Tenant</div>
      </q-card-section>
      <q-card-section>
        <q-toggle
          v-model="toggleStatus"
          :label="toggleStatus ? 'Ativo' : 'Inativo'"
          color="primary"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model="tenant.name"
          label="Nome"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxUsers"
          label="Usuários"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxConnections"
          label="Conexões"
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
          @click="validateAndHandleTenant"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarTenant, AlterarTenant } from 'src/service/empresas'
export default {
  name: 'ModalTenant',
  props: {
    modalTenant: {
      type: Boolean,
      default: false
    },
    tenantEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      tenant: {
        id: null,
        status: 'active',
        name: null,
        maxUsers: null,
        maxConnections: null,
        bmToken: null
      },
      toggleStatus: false
    }
  },
  watch: {
    'tenant.status': function (newStatus) {
      this.toggleStatus = newStatus === 'active'
    },
    toggleStatus: function (newToggleStatus) {
      this.tenant.status = newToggleStatus ? 'active' : 'inactive'
    }
  },
  methods: {
    resetarTenant () {
      this.tenant = {
        id: null,
        status: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        bmToken: null
      }
    },
    fecharModal () {
      this.resetarTenant()
      this.$emit('update:tenantEdicao', { id: null })
      this.$emit('update:modalTenant', false)
    },
    abrirModal () {
      if (this.tenantEdicao.id) {
        this.tenant = { ...this.tenantEdicao }
      } else {
        this.resetarTenant()
      }
    },
    async handleTenant () {
      try {
        this.loading = true
        if (this.tenant.id) {
          const { data } = await AlterarTenant(this.tenant)
          this.$emit('modal-tenant:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Empresa editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarTenant(this.tenant)
          this.$emit('modal-tenant:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Empresa criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro ao criar a Empresa', error)
      }
    },
    validateAndHandleTenant () {
      if (this.areRequiredFieldsFilled()) {
        this.handleTenant()
      } else {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: 'Preencha todos os campos obrigatórios!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    },
    areRequiredFieldsFilled () {
      return (
        this.tenant.name &&
        this.tenant.maxUsers !== null &&
        this.tenant.maxConnections !== null &&
        this.tenant.status !== null
      )
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
