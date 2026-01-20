<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      flat
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Campanhas"
      :rows="campanhas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          class="q-mr-md"
          color="black"
          icon="refresh"
          rounded
          @click="listarCampanhas"
        >
          <q-tooltip> Atualizar Listagem </q-tooltip>
        </q-btn>
        <q-btn
          rounded
          color="primary"
          label="Adicionar"
          @click="
            () => {
              campanhaEdicao = {}
              modalCampanha = true
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
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-account-details-outline"
            @click="contatosCampanha(props.row)"
          >
            <q-tooltip> Lista de Contatos da Campanha </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['pending', 'canceled'].includes(props.row.status)"
            icon="mdi-calendar-clock"
            @click="iniciarCampanha(props.row)"
          >
            <q-tooltip> Programar Envio </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['scheduled', 'processing'].includes(props.row.status)"
            icon="mdi-close-box-multiple"
            @click="cancelarCampanha(props.row)"
          >
            <q-tooltip> Cancelar Campanha </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="editarCampanha(props.row)"
          >
            <q-tooltip> Editar Campanha </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarCampanha(props.row)"
          >
            <q-tooltip> Excluir Campanha </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalCampanha
      v-if="modalCampanha"
      v-model:modalCampanha="modalCampanha"
      v-model:campanhaEdicao="campanhaEdicao"
      @modal-campanha:criada="campanhaCriada"
      @modal-campanha:editada="campanhaEditada"
    />
  </div>
</template>

<script setup>
import { format, parseISO, startOfDay } from 'date-fns'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { socketIO } from 'src/utils/socket'
import ModalCampanha from './ModalCampanha.vue'

const router = useRouter()
const $q = useQuasar()
const socket = socketIO()
const {
  campanhas,
  loading,
  listarCampanhas,
  deletarCampanha: deletarCampanhaStore,
  cancelarCampanha: cancelarCampanhaStore,
  iniciarCampanha: iniciarCampanhaStore,
  atualizarCampanha,
  getStatusLabel,
  getStatusColor
} = useCampanhas()

const usuario = JSON.parse(localStorage.getItem('usuario'))
const userProfile = ref('user')
const campanhaEdicao = ref({})
const modalCampanha = ref(false)

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

// O statusOptions local foi removido em favor do getStatusLabel da Store

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' },
  { name: 'name', label: 'Campanha', field: 'name', align: 'left' },
  {
    name: 'start',
    label: 'Início',
    field: 'start',
    align: 'center',
    format: v => format(parseISO(v), 'dd/MM/yyyy HH:mm')
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    format: v => getStatusLabel(v)
  },
  {
    name: 'contactsCount',
    label: 'Qtd. Contatos',
    field: 'contactsCount',
    align: 'center'
  },
  {
    name: 'pendentesEnvio',
    label: 'À Enviar',
    field: 'pendentesEnvio',
    align: 'center'
  },
  {
    name: 'pendentesEntrega',
    label: 'À Entregar',
    field: 'pendentesEntrega',
    align: 'center'
  },
  {
    name: 'recebidas',
    label: 'Recebidas',
    field: 'recebidas',
    align: 'center'
  },
  { name: 'lidas', label: 'Lidas', field: 'lidas', align: 'center' },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const isValidDate = v => {
  return startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
}

const campanhaCriada = () => {
  listarCampanhas()
}

const campanhaEditada = () => {
  listarCampanhas()
}

const editarCampanha = campanha => {
  if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
    notificarErro('Só é permitido editar campanhas que estejam pendentes ou canceladas.')
    return
  }
  campanhaEdicao.value = {
    ...campanha,
    start: campanha.start,
    end: campanha.start
  }
  modalCampanha.value = true
}

const deletarCampanha = campanha => {
  if (campanha.status !== 'pending' && campanha.status !== 'canceled' && campanha.contactsCount) {
    notificarErro(
      'Só é permitido deletar campanhas que estejam pendentes ou canceladas e não possuam contatos vinculados.'
    )
    return
  }
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Campanha "${campanha.name}"?`,
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
      await deletarCampanhaStore(campanha)
      notificarSucesso(`Campanha ${campanha.name} deletada!`)
    } catch (error) {
      console.error(error)
    }
  })
}

const contatosCampanha = campanha => {
  router.push({
    name: 'contatos-campanha',
    params: {
      campanhaId: campanha.id,
      campanha
    }
  })
}

const cancelarCampanha = campanha => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente cancelar a Campanha "${campanha.name}"?`,
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
      await cancelarCampanhaStore(campanha.id)
      notificarSucesso('Campanha cancelada.')
      listarCampanhas()
    } catch (err) {
      notificarErro('Não foi possível cancelar a campanha.', err)
    }
  })
}

const iniciarCampanha = async campanha => {
  if (!isValidDate(campanha.start)) {
    notificarErro('Não é possível programar campanha com data menor que a atual')
    return
  }

  if (campanha.contactsCount == 0) {
    notificarErro('Necessário ter contatos vinculados para programar a campanha.')
    return
  }

  if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
    notificarErro('Só é permitido programar campanhas que estejam pendentes ou canceladas.')
    return
  }

  try {
    await iniciarCampanhaStore(campanha.id)
    notificarSucesso('Campanha iniciada.')
    listarCampanhas()
  } catch (err) {
    notificarErro('Não foi possível iniciar a campanha.', err)
  }
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  listarCampanhas()
  socket.on(`${usuario.tenantId}:campaign`, data => {
    if (data.action === 'update') {
      atualizarCampanha(data.campaign)
    }
  })
})

onUnmounted(() => {
  socket.off(`${usuario.tenantId}:campaign`)
})
</script>

<style lang="scss" scoped></style>
