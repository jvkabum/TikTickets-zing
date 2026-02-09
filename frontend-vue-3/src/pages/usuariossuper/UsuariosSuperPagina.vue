<template>
  <div v-if="userProfile === 'super'">
    <q-table
      class="my-sticky-dynamic q-ma-lg"
      title="Usuarios"
      :rows="usuarioStore.usuarios.filter(u => u.profile !== 'super' && u.tenantId !== superTenantId)"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      @virtual-scroll="onScroll"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-select
          outlined
          dense
          rounded
          style="width: 300px"
          v-model="tenantId"
          :options="tenantOptions"
          option-label="name"
          option-value="id"
          map-options
          emit-value
          label="Filtrar por Empresa"
          clearable
          class="q-mr-md"
          @update:model-value="filtrarPorTenant"
        />
        <q-input
          style="width: 300px"
          outlined
          rounded
          dense
          class="col-grow"
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Localize"
          @update:model-value="filtrarUsuario"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          rounded
          class="q-ml-md col"
          :class="{
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          color="primary"
          label="Adicionar"
          @click="
            () => {
              usuarioSelecionado = {}
              modalUsuario = true
            }
          "
        />
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarUsuario(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ usuarioStore.usuarios.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ModalUsuarioSuper
      v-model:modalUsuario="modalUsuario"
      @modalUsuario:usuario-editado="listarUsuarios"
      @modalUsuario:usuario-criado="listarUsuarios"
      v-model:usuarioEdicao="usuarioSelecionado"
    />
    <ModalUsuarioEditSuper
      v-model:modalUsuario="modalUsuarioEdit"
      @modalUsuario:usuario-editado="listarUsuarios"
      v-model:usuarioEdicao="usuarioSelecionado"
    />
  </div>
</template>

<script setup>
import ModalUsuarioEditSuper from './ModalUsuarioEditSuper.vue'
import ModalUsuarioSuper from './ModalUsuarioSuper.vue'

import { useTenantStore } from 'src/stores/useTenantStore'

const $q = useQuasar()
const usuarioStore = useUsuarioStore()
const tenantStore = useTenantStore()
const { tenants } = storeToRefs(tenantStore)

const userProfile = ref('user')
const usuarioSelecionado = ref({})
const modalUsuario = ref(false)
const modalUsuarioEdit = ref(false)
const filter = ref(null)
const loading = ref(false)
const tenantId = ref(null)

const tenantOptions = computed(() => {
  if (superTenantId.value) {
    return tenants.value.filter(t => t.id !== superTenantId.value)
  }
  return tenants.value
})

const superTenantId = ref(null)

const pagination = reactive({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const params = reactive({
  pageNumber: 1,
  searchParam: null,
  hasMore: true
})

const optionsProfile = [
  { value: 'user', label: 'Usuário' },
  { value: 'admin', label: 'Administrador' },
  { value: 'super', label: 'Super' }
]

const columns = [
  {
    name: 'tenantId',
    label: 'Empresa',
    field: 'tenant',
    align: 'left',
    format: v => (v ? `${v.id} - ${v.name}` : '')
  },
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  {
    name: 'profile',
    label: 'Perfil',
    field: 'profile',
    align: 'left',
    format: v => optionsProfile.find(o => o.value == v)?.label || v
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const listarUsuarios = async () => {
  loading.value = true
  try {
    const filters = { ...params }
    if (tenantId.value) filters.tenantId = tenantId.value
    const data = await usuarioStore.adminListarUsuarios(filters)
    params.hasMore = data.hasMore
    pagination.lastIndex = usuarioStore.usuarios.length - 1
    pagination.rowsNumber = data.count
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const filtrarUsuario = data => {
  usuarioStore.usuarios = []
  params.pageNumber = 1
  params.searchParam = data
  listarUsuarios()
}

const filtrarPorTenant = value => {
  usuarioStore.usuarios = []
  params.pageNumber = 1
  tenantId.value = value
  listarUsuarios()
}

const onScroll = ({ to }) => {
  if (loading.value !== true && params.hasMore === true && to === pagination.lastIndex) {
    params.pageNumber++
    listarUsuarios()
  }
}

const editarUsuario = usuario => {
  usuarioSelecionado.value = { ...usuario }
  modalUsuarioEdit.value = true
}

onMounted(async () => {
  try {
    userProfile.value = localStorage.getItem('profile')
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'))
    if (usuarioLogado) {
      superTenantId.value = usuarioLogado.tenantId
    }
    await tenantStore.listarTenants()
    await listarUsuarios()
  } catch (error) {
    console.error('Falha ao carregar dados iniciais:', error)
  }
})
</script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0
</style>
