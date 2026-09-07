<template>
  <div v-if="userProfile === 'admin'">
    <q-card
      flat
      class="q-ma-sm"
    >
      <q-card-section>
        <div class="row text-h6">Campanha: {{ route.params.campanha.name }}</div>
        <div class="row text-caption">
          Início: {{ formatDate(route.params.campanha.start) }} - Status:
          {{ route.params.campanha.status }}
        </div>
        <q-btn
          rounded
          class="absolute-top-right q-ma-md"
          icon="mdi-arrow-left"
          label="Listar Campanhas"
          color="black"
          @click="router.push({ name: 'campanhas' })"
        />
      </q-card-section>
    </q-card>
    <q-table
      class="my-sticky-dynamic q-ma-sm"
      title="Contatos"
      id="tabela-contatos-campanha"
      :rows="contatosCampanha"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      separator="cell"
    >
      <template v-slot:top>
        <div class="row col-4 q-table__title items-center">Contatos</div>
        <q-space />
        <q-btn
          rounded
          class="q-ml-md"
          color="black"
          icon="refresh"
          @click="listarContatosCampanha"
        >
          <q-tooltip> Atualizar Listagem </q-tooltip>
        </q-btn>
        <q-btn
          class="q-ml-md"
          color="negative"
          icon="close"
          outline
          rounded
          label="Limpar Campanha"
          @click="deletarTodosContatosCampanha"
          v-if="route.params.campanha.status === 'pending' || route.params.campanha.status === 'canceled'"
        />
        <q-btn
          class="q-ml-md"
          color="primary"
          label="Incluir Contatos"
          icon="add"
          rounded
          v-if="route.params.campanha.status === 'pending' || route.params.campanha.status === 'canceled'"
          @click="modalAddContatosCampanha = !modalAddContatosCampanha"
        />
      </template>
      <template v-slot:body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar style="border: 1px solid #9e9e9ea1 !important">
            <q-icon
              name="mdi-account"
              size="1.5em"
              color="grey-5"
              v-if="!props.value"
            />
            <q-img
              :src="props.value"
              style="max-width: 150px"
            >
              <template v-slot:error>
                <q-icon
                  name="mdi-account"
                  size="1.5em"
                  color="grey-5"
                />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            v-if="route.params.campanha.status === 'pending'"
            flat
            round
            icon="mdi-delete"
            @click="deletarContatoCampanha(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contatosCampanha.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>

    <ModalAdicionarContatos
      v-model="modalAddContatosCampanha"
      :etiquetas="etiquetas"
      :usuarios="usuarios"
      @added="listarContatosCampanha"
    />
  </div>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import ModalAdicionarContatos from 'src/components/campanhas/ModalAdicionarContatos.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const campanhaStore = useCampanhaStore()
const {
  listarContatosCampanha: listarContatosCampanhaStore,
  deletarContatoCampanha: deletarContatoCampanhaStore,
  deletarTodosContatosCampanha: deletarTodosContatosCampanhaStore
} = campanhaStore

const etiquetaStore = useEtiquetaStore()
const usuarioStore = useUsuarioStore()

const userProfile = ref('user')

const modalAddContatosCampanha = ref(false)
const etiquetas = ref([])
const usuarios = ref([])
const contatosCampanha = ref([])
const loading = ref(false)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const ACK = {
  '-1': 'Error',
  0: 'Envio Pendente',
  1: 'Entrega Pendente',
  2: 'Recebida',
  3: 'Lida',
  4: 'Reproduzido'
}

const definirEstadoNumero = numero => {
  const ddd = numero.substring(2, 4)
  return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
}

const columns = [
  {
    name: 'profilePicUrl',
    label: '',
    field: 'profilePicUrl',
    style: 'width: 50px',
    align: 'center'
  },
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    style: 'width: 300px'
  },
  {
    name: 'number',
    label: 'WhatsApp',
    field: 'number',
    align: 'center',
    style: 'width: 300px'
  },
  {
    name: 'campaignContacts',
    label: 'Status',
    field: 'campaignContacts',
    align: 'center',
    style: 'width: 200px',
    format: v => (v ? ACK[v[0].ack] : '')
  },
  {
    name: 'tags',
    label: 'Etiquetas',
    field: 'tags',
    style: 'width: 500px',
    align: 'left',
    format: v => (v ? v.map(i => i.tag).join(', ') : '')
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'number',
    style: 'width: 500px',
    align: 'left',
    format: v => definirEstadoNumero(v)
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const formatDate = (date, dateMask = 'dd/MM/yyyy') => {
  return format(parseISO(date), dateMask)
}

const listarEtiquetas = async () => {
  try {
    const data = await etiquetaStore.listarEtiquetas(true)
    etiquetas.value = data
  } catch (error) {
    console.error(error)
  }
}

const listarContatosCampanha = async () => {
  try {
    loading.value = true
    const data = await listarContatosCampanhaStore(route.params.campanhaId)
    contatosCampanha.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const listarUsuarios = async () => {
  try {
    const data = await usuarioStore.listarUsuarios()
    usuarios.value = data.users
  } catch (error) {
    console.error(error)
    notificarErro('Problema ao carregar usuários', error)
  }
}

const deletarContatoCampanha = async contato => {
  try {
    await deletarContatoCampanhaStore(route.params.campanhaId, contato.id)
    listarContatosCampanha()
    $q.notify({
      type: 'positive',
      message: 'Contato excluído desta campanha',
      position: 'top'
    })
  } catch (error) {
    console.error(error)
    notificarErro('Verifique os erros...', error)
  }
}

const deletarTodosContatosCampanha = () => {
  $q.dialog({
    title: 'Atenção!!',
    message: 'Deseja realmente retirar todos os contatos desta campanha?',
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  }).onOk(async () => {
    try {
      await deletarTodosContatosCampanhaStore(route.params.campanhaId)
      contatosCampanha.value = []
      notificarSucesso('Contatos excluídos desta campanha')
    } catch (error) {
      console.error(error)
      notificarErro('Não foi possível excluir os contatos da campanha', error)
    }
  })
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  const campanhaParams = route.params.campanha
  if (!campanhaParams) {
    router.push({ name: 'campanhas' })
    return
  }
  listarEtiquetas()
  listarUsuarios()
  listarContatosCampanha()
})
</script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 75vh

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

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px
</style>
