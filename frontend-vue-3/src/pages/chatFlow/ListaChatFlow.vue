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
              <q-btn
                color="blue-3"
                icon="edit"
                flat
                round
                class="bg-padrao"
                @click="editFlow(props.row)"
              >
                <q-tooltip> Editar informações </q-tooltip>
              </q-btn>
              <q-btn
                color="blue-3"
                icon="mdi-content-duplicate"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="duplicarFluxo(props.row)"
              >
                <q-tooltip> Duplicar Fluxo </q-tooltip>
              </q-btn>
              <q-btn
                color="blue-3"
                icon="mdi-sitemap"
                flat
                round
                class="bg-padrao"
                @click="abrirFluxo(props.row)"
              >
                <q-tooltip> Abrir Fluxo </q-tooltip>
              </q-btn>
              <q-btn
                color="blue-3"
                icon="delete"
                flat
                round
                class="bg-padrao"
                @click="deletarFluxo(props.row)"
              >
                <q-tooltip> Excluir </q-tooltip>
              </q-btn>
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
import { storeToRefs } from 'pinia'
import { ListarUsuarios } from 'src/service/user'
import { useChatFlowStore } from 'src/stores/useChatFlowStore'
import { useFilaStore } from 'src/stores/useFilaStore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ModalChatFlow from './ModalChatFlow.vue'

const router = useRouter()
const chatFlowStore = useChatFlowStore()
const { chatFlows: listachatFlow, loading } = storeToRefs(chatFlowStore)
const { listarChatFlows, deletarChatFlow, setFlowData } = chatFlowStore

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
    const { data } = await ListarUsuarios(params.value)
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
const novoFluxoCriado = () => {}
const fluxoEditado = () => {}

onMounted(async () => {
  await listarChatFlows()
  await listarFilas()
  await listarUsuarios()
})
</script>

<style lang="scss" scoped></style>
