<template>
  <div>
    <div class="row">
      <div class="col">
        <q-table
          square
          flat
          bordered
          class="my-sticky-dynamic q-ma-lg"
          title="Fluxos"
          hide-bottom
          :rows="listachatFlow"
          :columns="columns"
          :loading="loading"
          row-key="id"
          v-model:pagination="pagination"
          :rows-per-page-options="[0]"
        >
          <template v-slot:top-right>
            <q-btn
              class="q-ml-md"
              color="primary"
              label="Adicionar"
              rounded
              @click="
                () => {
                  chatFlowSelecionado = {}
                  modalChatFlow = true
                }
              "
            />
          </template>
          <template v-slot:body-cell-isActive="props">
            <q-td class="text-center">
              <q-icon
                size="16px"
                :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                :color="props.value ? 'positive' : 'negative'"
                class=""
              />
              <span class="q-mx-xs text-bold">
                {{ props.value ? 'Ativo' : 'Inativo' }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td class="text-center">
              <div class="row items-center justify-center no-wrap q-gutter-xs">
                <q-btn
                  color="primary"
                  icon="edit"
                  flat
                  round
                  dense
                  @click="editFlow(props.row)"
                >
                  <q-tooltip> Editar informações </q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  icon="mdi-content-duplicate"
                  flat
                  round
                  dense
                  @click="duplicarFluxo(props.row)"
                >
                  <q-tooltip> Duplicar Fluxo </q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  icon="mdi-sitemap"
                  flat
                  round
                  dense
                  @click="abrirFluxo(props.row)"
                >
                  <q-tooltip> Abrir Fluxo </q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  flat
                  round
                  dense
                  @click="deletarFluxo(props.row)"
                >
                  <q-tooltip> Excluir </q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <ModalChatFlow
      v-model:modalChatFlow="modalChatFlow"
      v-model:chatFlowEdicao="chatFlowSelecionado"
      @chatFlow:criada="novoFluxoCriado"
      @chatFlow:editado="fluxoEditado"
    />
    <q-dialog
      v-model="confirmDelete"
      persistent
    >
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Você tem certeza que dessa escluir esse fluxo?</div>
          <div>{{ chatFlowSelecionado.name }}</div>
        </q-card-section>
        <q-card-actions
          align="right"
          class="text-primary"
        >
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
            class="q-mr-md"
          />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            v-close-popup
            @click="confirmDeleteFoo()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import ModalChatFlow from './ModalChatFlow.vue'

const router = useRouter()
const chatFlowStore = useChatFlowStore()
const { chatFlows: listachatFlow, loading } = storeToRefs(chatFlowStore)
const { listarChatFlows, deletarChatFlow, setFlowData } = chatFlowStore

const usuarioStore = useUsuarioStore()

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)
const { listarFilas } = filaStore

const confirmDelete = ref(false)
const modalChatFlow = ref(false)
const chatFlowSelecionado = ref({})
const usuarios = ref([])

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const params = ref({
  pageNumber: 1,
  searchParam: null,
  hasMore: true
})

const columns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'isActive', label: 'Status', field: 'isActive', align: 'center' },
  {
    name: 'celularTeste',
    label: 'Celular Teste',
    field: 'celularTeste',
    align: 'center'
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'center' }
]

const listarUsuarios = async () => {
  try {
    const data = await usuarioStore.listarUsuarios(params.value)
    usuarios.value = data.users
  } catch (error) {
    console.error(error)
  }
}

const duplicarFluxo = flow => {
  chatFlowSelecionado.value = { ...flow, isDuplicate: true }
  modalChatFlow.value = true
}

const editFlow = flow => {
  chatFlowSelecionado.value = flow
  modalChatFlow.value = true
}

const abrirFluxo = async flow => {
  setFlowData({
    usuarios: usuarios.value,
    filas: filas.value,
    flow
  })
  localStorage.setItem('currentChatFlow', JSON.stringify(flow))
  router.push({ name: 'chat-flow-builder' })
}

const deletarFluxo = flow => {
  chatFlowSelecionado.value = flow
  confirmDelete.value = true
}

const confirmDeleteFoo = async () => {
  try {
    await deletarChatFlow(chatFlowSelecionado.value)
  } catch (error) {
    console.error(error)
  }
}

// Handlers for modal events - can be placeholders as store handles logic
const novoFluxoCriado = (flow) => {
  listarChatFlows()
}
const fluxoEditado = (flow) => {
  listarChatFlows()
}

onMounted(async () => {
  await listarChatFlows()
  await listarFilas()
  await listarUsuarios()
})
</script>

<style lang="scss" scoped></style>
