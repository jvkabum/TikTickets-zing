<template>
  <div>
    <q-card class="q-ma-md">
      <q-card-section class="q-pa-sm">
        <div class="text-h6 q-pa-md text-center">
          Módulo de Auto Resposta (Legado) - Utilize o Chat Flow Builder para novos fluxos.
        </div>
      </q-card-section>
    </q-card>

    <template v-if="false">
      <div class="row">
        <div class="col">
          <q-table
            square
            flat
            bordered
            class="my-sticky-dynamic q-ma-lg"
            title="Auto Resposta"
            hide-bottom
            :data="autoRespostas"
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
                @click="handleAddAutoResposta"
              />
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-btn
                    size="sm"
                    color="accent"
                    round
                    dense
                    @click="props.expand = !props.expand"
                    :icon="props.expand ? 'remove' : 'add'"
                  />
                </q-td>
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.value }}
                </q-td>
                <q-td
                  auto-width
                  class="text-center"
                >
                  <q-btn
                    dense
                    flat
                    round
                    icon="edit"
                    @click="editarAutoResposta(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="mdi-delete"
                    @click="handleDeleteAutoResposta(props.row)"
                  />
                </q-td>
              </q-tr>
              <q-tr
                v-show="props.expand"
                :props="props"
              >
                <q-td colspan="100%">
                  <q-table
                    class="my-sticky-dynamic"
                    title="Etapas"
                    square
                    flat
                    bordered
                    hide-bottom
                    :data="props.row.stepsReply"
                    :columns="columnsEtapas"
                    :loading="loading"
                    row-key="id"
                    v-model:pagination="pagination"
                    :rows-per-page-options="[0]"
                  >
                    <template v-slot:top-right>
                      <q-btn
                        class="q-ml-md"
                        color="primary"
                        outline
                        label="Nova Etapa"
                        @click="novaEtapa(props.row)"
                      />
                    </template>
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th auto-width />
                        <q-th
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                        >
                          {{ col.label }}
                        </q-th>
                      </q-tr>
                    </template>
                    <template v-slot:body="etapas">
                      <q-tr :props="etapas">
                        <q-td auto-width>
                          <q-btn
                            size="sm"
                            color="accent"
                            round
                            dense
                            @click="etapas.expand = !etapas.expand"
                            :icon="etapas.expand ? 'remove' : 'add'"
                          />
                        </q-td>
                        <q-td
                          v-for="col in etapas.cols"
                          :key="col.name"
                          :props="etapas"
                        >
                          {{ col.value }}
                        </q-td>
                        <q-td
                          auto-width
                          class="text-center"
                        >
                          <q-btn
                            dense
                            flat
                            round
                            icon="edit"
                            @click="editarEtapaAutoResposta(props.row, etapas.row)"
                          />
                          <q-btn
                            flat
                            dense
                            round
                            icon="mdi-delete"
                            @click="handleDeleteEtapaAutoResposta(props.row, etapas.row)"
                          />
                        </q-td>
                      </q-tr>
                      <q-tr
                        v-show="etapas.expand"
                        :props="etapas"
                      >
                        <q-td colspan="100%">
                          <q-table
                            square
                            flat
                            bordered
                            class="my-sticky-dynamic"
                            title="Ações"
                            :data="etapas.row.stepsReplyAction"
                            :columns="columnsAcoes"
                            :loading="loading"
                            row-key="id"
                            hide-bottom
                            v-model:pagination="pagination"
                            :rows-per-page-options="[0]"
                          >
                            <template v-slot:top-right>
                              <q-btn
                                class="q-ml-md"
                                color="black"
                                glossy
                                label="Nova Ação"
                                outline
                                @click="criarAcaoEtapa(props.row, etapas.row)"
                              />
                            </template>
                            <template v-slot:body-cell-acoes="acao">
                              <q-td class="text-center">
                                <q-icon
                                  size="24px"
                                  :name="!acao.row.replyDefinition ? 'mdi-email-off-outline' : 'mdi-email-send-outline'"
                                  class="q-mr-sm"
                                >
                                  <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
                                    <span class="text-weight-medium"> Mensagem de retorno: </span>
                                    <span class="row col">
                                      {{ acao.row.replyDefinition || 'Sem mensagem de retorno' }}
                                    </span>
                                  </q-tooltip>
                                </q-icon>

                                <q-btn
                                  flat
                                  round
                                  icon="edit"
                                  @click="editarAcaoEtapa(props.row, etapas.row, acao.row)"
                                />
                                <q-btn
                                  flat
                                  round
                                  icon="mdi-delete"
                                  @click="handleDeleteAcaoEtapa(props.row, etapas.row, acao.row)"
                                />
                              </q-td>
                            </template>
                            <!-- <template :props="acao">
                            <q-tr v-show="acao.row.replyDefinition">
                              <q-td colspan="100%">
                                Mensagem: acao.row.replyDefinition
                              </q-td>
                            </q-tr>
                          </template> -->
                          </q-table>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:body-cell-isActive="props">
              <q-td class="text-center">
                <q-icon
                  size="24px"
                  :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                  :color="props.value ? 'positive' : 'negative'"
                  class=""
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
      <ModalAutoResposta
        v-model:modalAutoResposta="modalAutoResposta"
        v-model:autoRespostaEdicao="autoRespostaSelecionado"
      />
      <ModalEtapaAutoResposta
        v-model:modalEtapaAutoResposta="modalEtapaAutoResposta"
        v-model:etapaAutoRespostaEdicao="etapaAutoRespostaEdicao"
        :autoReply="autoReply"
      />
      <ModalAcaoEtapa
        v-model:modalAcaoEtapa="modalAcaoEtapa"
        v-model:acaoEtapaEdicao="acaoEtapaEdicao"
        :filas="filas"
        :autoReply="autoReply"
        v-model:etapaAutoResposta="etapaAutoRespostaEdicao"
        :usuarios="usuarios"
      />
    </template>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { ListarUsuarios } from 'src/service/user'
import { useAutoRespostaStore } from 'src/stores/useAutoRespostaStore'
import { useFilaStore } from 'src/stores/useFilaStore'
import { onMounted, ref } from 'vue'

import ModalAcaoEtapa from './ModalAcaoEtapa.vue'
import ModalAutoResposta from './ModalAutoResposta.vue'
import ModalEtapaAutoResposta from './ModalEtapaAutoResposta.vue'

const $q = useQuasar()
const autoRespostaStore = useAutoRespostaStore()
const { autoRespostas, loading } = storeToRefs(autoRespostaStore)
const { listarAutoRespostas, deletarAutoResposta, deletarEtapa, deletarAcao } = autoRespostaStore

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)
const { listarFilas } = filaStore

const usuarios = ref([])
const params = ref({
  pageNumber: 1,
  searchParam: null,
  hasMore: true
})

// Modal states
const modalAutoResposta = ref(false)
const autoRespostaSelecionado = ref({})

const modalEtapaAutoResposta = ref(false)
const etapaAutoRespostaEdicao = ref({})
const autoReply = ref({})

const modalAcaoEtapa = ref(false)
const acaoEtapaEdicao = ref({})
// const etapaAutoResposta = ref({}) // Renamed to ensure consistency, passing as prop via v-model or prop

const tipoAutoResposta = [
  { value: '0', label: 'Entrada (Criação do Ticket)' },
  { value: '1', label: 'Encerramento (Resolução Ticket)' }
]

const acaoEtapa = [
  { value: '0', label: 'Próxima Etapa' },
  { value: '1', label: 'Encaminhar para Fila' },
  { value: '2', label: 'Ecaminhar para Usuário' }
]

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columns = [
  { name: 'expand', label: '', field: 'expand', align: 'left' },
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  {
    name: 'action',
    label: 'Tipo',
    field: 'action',
    align: 'left',
    format: v => tipoAutoResposta.find(a => a.value == v)?.label || ''
  },
  {
    name: 'isActive',
    label: 'Status',
    field: 'isActive',
    align: 'center',
    format: v => (v === true ? 'Ativo' : 'Inativo')
  },
  {
    name: 'celularTeste',
    label: 'Celular Teste',
    field: 'celularTeste',
    align: 'center'
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'center' }
]

const columnsEtapas = [
  { name: 'expand', label: '', field: 'expand', align: 'left' },
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'center',
    sortable: true,
    sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'reply',
    label: 'Mensagem',
    field: 'reply',
    align: 'left',
    classes: 'ellipsis',
    style: 'max-width: 400px;'
  },
  {
    name: 'initialStep',
    label: 'Etapa Inicial',
    sortable: true,
    field: 'initialStep',
    align: 'left',
    format: v => (v ? 'Sim' : '')
  },
  { name: 'acoes', label: '', field: 'acoes', align: 'center' }
]

const columnsAcoes = [
  { name: 'words', label: 'Chave', field: 'words', align: 'left' },
  {
    name: 'action',
    label: 'Ação',
    field: 'action',
    align: 'left',
    format: v => acaoEtapa.find(a => a.value == v)?.label
  },
  {
    name: 'queueId',
    label: 'Fila Destino',
    field: 'queueId',
    align: 'center',
    format: v => (v ? filas.value.find(f => f.id === v)?.queue : '')
  },
  {
    name: 'userIdDestination',
    label: 'Usuário Destino',
    field: 'userIdDestination',
    align: 'center',
    format: v => (v ? usuarios.value.find(u => u.id === v)?.name : '')
  },
  {
    name: 'nextStepId',
    label: 'ID Etapa destino',
    field: 'nextStepId',
    align: 'center'
  },
  { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
]

const handleAddAutoResposta = () => {
  autoRespostaSelecionado.value = {}
  modalAutoResposta.value = true
}

const listarUsuarios = async () => {
  try {
    const { data } = await ListarUsuarios(params.value)
    usuarios.value = data.users
  } catch (error) {
    console.error(error)
  }
}

const editarAutoResposta = row => {
  autoRespostaSelecionado.value = row
  modalAutoResposta.value = true
}

const handleDeleteAutoResposta = row => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Auto Resposta "${row.name}"?`,
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
  }).onOk(() => {
    deletarAutoResposta(row.id)
  })
}

const novaEtapa = row => {
  autoReply.value = row
  etapaAutoRespostaEdicao.value = {}
  modalEtapaAutoResposta.value = true
}

const editarEtapaAutoResposta = (row, etapa) => {
  autoReply.value = row
  etapaAutoRespostaEdicao.value = etapa
  modalEtapaAutoResposta.value = true
}

const handleDeleteEtapaAutoResposta = (row, etapa) => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Etapa "ID: ${etapa.id}"?`,
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
  }).onOk(() => {
    deletarEtapa(etapa)
  })
}

const criarAcaoEtapa = (row, etapa) => {
  autoReply.value = row
  etapaAutoRespostaEdicao.value = etapa
  modalAcaoEtapa.value = true
}

const editarAcaoEtapa = (row, etapa, acao) => {
  autoReply.value = row
  etapaAutoRespostaEdicao.value = etapa
  acaoEtapaEdicao.value = acao
  modalAcaoEtapa.value = true
}

const handleDeleteAcaoEtapa = (row, etapa, acao) => {
  $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar a Ação de "Chave: ${acao.words}"?`,
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
  }).onOk(() => {
    deletarAcao(acao)
  })
}

// Handler functions for modal events - now just placeholders or closing logic if needed
// Actually, modals will update the store directly, so we just need to ensure the list is reactive
// The <Modal...> components currently emit 'autoResposta:criada' etc.
// We should update the TEMPLATE to remove those listeners or update them to just close modal if not handled inside modal

// Re-implementing simplified handlers if the template still calls them
const autoRespostaCriada = () => {}
const autoRespostaEditada = () => {}
const etapaAutoRespostaCriada = () => {}
const etapaAutoRespostaEditada = () => {}
const acaoCriada = () => {}
const acaoEditada = () => {}

onMounted(() => {
  listarAutoRespostas()
  listarFilas()
  listarUsuarios()
})
</script>

<style lang="scss" scoped></style>
