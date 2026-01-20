<template>
  <div v-if="userProfile === 'super'">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Empresas"
      :rows="tenantStore.tenants.filter(tenant => tenant.id !== 1)"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          rounded
          color="primary"
          label="Adicionar"
          @click="
            () => {
              tenantEdicao = {}
              modalTenant = true
            }
          "
        />
      </template>
      <template v-slot:body-cell-color="{ row }">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${row.color}`"
          >
            {{ row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            style="margin-right: 10px"
            @click="editarTenant(props.row)"
          />
          <q-btn
            flat
            round
            icon="delete"
            @click="deletarTenant(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :class="getColClass(props.row)">
          {{ formatStatus(props.row.status) }}
        </q-td>
      </template>
    </q-table>
    <ModalTenant
      v-model:modalTenant="modalTenant"
      v-model:tenantEdicao="tenantEdicao"
      @modal-tenant:criada="onTenantCriada"
      @modal-tenant:editada="onTenantEditada"
    />
  </div>
</template>

<script setup>
import ModalTenant from './ModalTenant.vue'

const $q = useQuasar()
const tenantStore = useTenantStore()

const userProfile = ref('user')
const tenantEdicao = ref({})
const modalTenant = ref(false)
const loading = ref(false)

const pagination = reactive({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    format: val => formatStatus(val)
  },
  { name: 'name', label: 'Nome', field: 'name', align: 'center' },
  {
    name: 'maxUsers',
    label: 'Limite de Usuário',
    field: 'maxUsers',
    align: 'center'
  },
  {
    name: 'maxConnections',
    label: 'Limite de Conexão',
    field: 'maxConnections',
    align: 'center'
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const getColClass = row => {
  return row.status === 'active' ? 'bg-active' : 'bg-inactive'
}

const formatStatus = value => {
  return value === 'active' ? 'Ativo' : 'Inativo'
}

const listarTenants = async () => {
  loading.value = true
  try {
    await tenantStore.listarTenants()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const onTenantCriada = tenant => {
  // A store já lida com a adição interna se necessário
}

const onTenantEditada = tenant => {
  // A store já lida com a atualização interna se necessário
}

const editarTenant = tenant => {
  tenantEdicao.value = { ...tenant }
  modalTenant.value = true
}

const deletarTenant = tenant => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Empresa "${tenant.id}"?`,
    cancel: {
      label: 'Não',
      color: 'primary',
      push: true
    },
    ok: {
      label: 'Sim',
      color: 'negative',
      push: true
    },
    persistent: true
  }).onOk(async () => {
    loading.value = true
    try {
      await tenantStore.deletarTenant(tenant)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: `Empresa ${tenant.id} deletada!`,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarTenants()
})
</script>

<style lang="scss" scoped>
.bg-active {
  background-color: #21ba45;
}

.bg-inactive {
  background-color: #c10015;
}
</style>
