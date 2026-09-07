<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      class="my-sticky-dynamic q-ma-lg shadow-premium"
      title="Etiquetas"
      :rows="etiquetas"
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
              etiquetaEdicao = {}
              modalEtiqueta = true
            }
          "
        />
      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
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
      <template v-slot:body-cell-autoTag="props">
        <q-td class="text-center">
          {{ props.row.autoTag }}
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
              @click="editarEtiqueta(props.row)"
            />
            <q-btn
              color="negative"
              flat
              round
              icon="mdi-delete"
              @click="deletarEtiqueta(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <ModalEtiqueta
      v-model:modalEtiqueta="modalEtiqueta"
      v-model:etiquetaEdicao="etiquetaEdicao"
    />
  </div>
</template>

<script setup>

const $q = useQuasar()
const store = useEtiquetaStore()
const { etiquetas, loading } = storeToRefs(store)
const { listarEtiquetas, deletarEtiqueta: deletarEtiquetaStore } = store

const userProfile = ref('user')
const etiquetaEdicao = ref({})
const modalEtiqueta = ref(false)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' },
  { name: 'tag', label: 'Etiqueta', field: 'tag', align: 'left' },
  { name: 'color', label: 'Cor', field: 'color', align: 'center' },
  { name: 'isActive', label: 'Ativo', field: 'isActive', align: 'center' },
  { name: 'autoTag', label: 'Auto Tag', field: 'autoTag', align: 'center' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const editarEtiqueta = etiqueta => {
  etiquetaEdicao.value = { ...etiqueta }
  modalEtiqueta.value = true
}

const deletarEtiqueta = etiqueta => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Etiqueta "${etiqueta.tag}"?`,
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
    try {
      await deletarEtiquetaStore(etiqueta)
      $q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: `Etiqueta ${etiqueta.tag} deletada!`,
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white'
          }
        ]
      })
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarEtiquetas()
})
</script>

<style lang="scss" scoped></style>
