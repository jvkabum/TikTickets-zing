<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      class="my-sticky-dynamic q-ma-lg shadow-premium"
      title="Filas"
      :rows="filas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Adicionar"
          rounded
          @click="
            () => {
              filaEdicao = {}
              modalFila = true
            }
          "
        />
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
          <div class="row items-center justify-center no-wrap q-gutter-xs">
            <q-btn
              color="primary"
              flat
              round
              icon="edit"
              @click="editarFila(props.row)"
            />
            <q-btn
              color="negative"
              flat
              round
              icon="mdi-delete"
              @click="deletarFila(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <ModalFila
      v-model:modalFila="modalFila"
      v-model:filaEdicao="filaEdicao"
      @modal-fila:criada="filaCriada"
      @modal-fila:editada="filaEditada"
    />
  </div>
</template>

<script setup>
import ModalFila from './ModalFila.vue'

const $q = useQuasar()
const filaStore = useFilaStore()
const { filas, loading } = storeToRefs(filaStore)
const { listarFilas, deletarFila: deletarFilaStore } = filaStore

const userProfile = ref('user')
const filaEdicao = ref({})
const modalFila = ref(false)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' },
  { name: 'queue', label: 'Fila', field: 'queue', align: 'left' },
  { name: 'isActive', label: 'Ativo', field: 'isActive', align: 'center' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const filaCriada = fila => {
  // Store updates automatically, but we might want to refresh list?
  // Actually creation adds to store state, so no action needed if push was done.
}

const filaEditada = fila => {
  // Store updates automatically
}

const editarFila = fila => {
  filaEdicao.value = { ...fila }
  modalFila.value = true
}

const deletarFila = fila => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Fila "${fila.queue}"?`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    try {
      await deletarFilaStore(fila)
      $q.notify({
        type: 'positive',
        message: `Fila ${fila.queue} deletada!`,
        position: 'top'
      })
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarFilas()
})
</script>

<style lang="scss" scoped></style>
