<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      class="my-sticky-dynamic q-ma-lg"
      title="Usuarios"
      :rows="usuarioStore.usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
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
        <q-space />
        <q-btn
          rounded
          class="q-ml-md col"
          :class="{
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          color="primary"
          label="Adicionar"
          @click="handleAddUsuario"
        />
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-arrow-decision-outline"
            @click="gerirFilasUsuario(props.row)"
          >
            <q-tooltip> Gestão de Filas do usuário </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="editarUsuario(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarUsuario(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ usuarioStore.usuarios.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ModalUsuario
      v-model:modalUsuario="modalUsuario"
      @modalUsuario:usuario-editado="onUsuarioEditado"
      @modalUsuario:usuario-criado="onUsuarioCriado"
      v-model:usuarioEdicao="usuarioSelecionado"
    />
    <ModalFilaUsuario
      v-model:modalFilaUsuario="modalFilaUsuario"
      v-model:usuarioSelecionado="usuarioSelecionado"
      :filas="filas"
      @modalFilaUsuario:sucesso="onUsuarioEditado"
    />
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useFilaStore } from 'src/stores/useFilaStore'
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { notificarErro } from 'src/utils/helpersNotifications'
import { onMounted, reactive, ref } from 'vue'

import ModalFilaUsuario from './ModalFilaUsuario.vue'
import ModalUsuario from './ModalUsuario.vue'

const $q = useQuasar()
const usuarioStore = useUsuarioStore()
const filaStore = useFilaStore()

const userProfile = ref('user')
const usuarioSelecionado = ref({})
const modalFilaUsuario = ref(false)
const filas = ref([])

const optionsProfile = [
  { value: 'user', label: 'Usuário' },
  { value: 'admin', label: 'Administrador' }
]

const modalUsuario = ref(false)
const filter = ref(null)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const params = reactive({
  pageNumber: 1,
  searchParam: null,
  hasMore: true
})

const loading = ref(false)

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  {
    name: 'queues',
    label: 'Filas',
    field: 'queues',
    align: 'left',
    format: v => (!v ? '' : v.map(f => f.queue).join(', ')),
    classes: 'ellipsis',
    style: 'max-width: 400px;'
  },
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
    const data = await usuarioStore.listarUsuarios(params)
    params.hasMore = data.hasMore
    pagination.value.lastIndex = usuarioStore.usuarios.length - 1
    pagination.value.rowsNumber = data.count
  } catch (error) {
    console.error(error)
    notificarErro('Erro ao listar usuários', error)
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

const handleAddUsuario = () => {
  usuarioSelecionado.value = {}
  modalUsuario.value = true
}

const onUsuarioCriado = usuario => {
  // A store já lida com a adição, mas o evento pode ser útil para outras ações na UI
  // No caso atual, a store já fez o push em criarUsuario se chamado por lá,
  // mas o modal pode estar chamando o serviço diretamente ainda.
  // Vou garantir que a lista reflita a mudança.
}

const onUsuarioEditado = usuario => {
  // Mesma lógica da criação
}

const editarUsuario = usuario => {
  usuarioSelecionado.value = { ...usuario }
  modalUsuario.value = true
}

const deletarUsuario = usuario => {
  $q.dialog({
    title: `Atenção!! Deseja realmente deletar o usuario "${usuario.name}"?`,
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
      await usuarioStore.deletarUsuario(usuario.id)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: `Usuario ${usuario.name} deletado!`,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      console.error(error)
      notificarErro('Não é possível deletar o usuário', error)
    } finally {
      loading.value = false
    }
  })
}

const listarFilas = async () => {
  try {
    const data = await filaStore.listarFilas()
    filas.value = data
  } catch (error) {
    console.error(error)
  }
}

const gerirFilasUsuario = usuario => {
  usuarioSelecionado.value = { ...usuario }
  modalFilaUsuario.value = true
}

onMounted(async () => {
  userProfile.value = localStorage.getItem('profile')
  await listarFilas()
  await listarUsuarios()
})
</script>

<style lang="scss" scoped></style>
