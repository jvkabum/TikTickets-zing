<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 80vw; width: 80vw" class="glass-premium border-glass no-shadow rounded-all shadow-premium unified-modal-color">
      <q-card-section class="q-pt-none q-pt-md">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros (Data criação do contato)</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-grow">
              <label>Início</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.startDate"
              />
            </div>
            <div class="col-grow">
              <label>Final</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.endDate"
              />
            </div>
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                label="Estado (s)"
                dense
                rounded
                outlined
                v-model="pesquisa.ddds"
                multiple
                :options="estadosBR"
                use-chips
                option-value="sigla"
                option-label="nome"
                emit-value
                map-options
                dropdown-icon="add"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label><span v-html="opt.nome"></span></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :model-value="selected"
                        @update:model-value="toggleOption(opt)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <q-badge
                    dense
                    rounded
                    color="grey-3"
                    text-color="primary"
                    class="q-ma-xs text-body1"
                    :label="opt.nome"
                  >
                  </q-badge>
                </template>
              </q-select>
            </div>
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                outlined
                label="Etiqueta (a)"
                dense
                rounded
                v-model="pesquisa.tags"
                multiple
                :options="etiquetas"
                use-chips
                option-value="id"
                option-label="tag"
                emit-value
                map-options
                dropdown-icon="add"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label><span v-html="opt.tag"></span></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :model-value="selected"
                        @update:model-value="toggleOption(opt)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <q-chip
                    dense
                    rounded
                    color="white"
                    text-color="primary"
                    class="q-ma-xs text-body1"
                  >
                    <q-icon
                      :style="`color: ${opt.color}`"
                      name="mdi-pound-box-outline"
                      size="28px"
                      class="q-mr-sm"
                    />
                    {{ opt.tag }}
                  </q-chip>
                </template>
              </q-select>
            </div>
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-select
                outlined
                rounded
                label="Carteira"
                dense
                v-model="pesquisa.wallets"
                multiple
                :options="usuarios"
                use-chips
                option-value="id"
                option-label="name"
                emit-value
                map-options
                dropdown-icon="add"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label><span v-html="opt.name"></span></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :model-value="selected"
                        @update:model-value="toggleOption(opt)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-xs-12 col-sm-4 grow text-center">
              <q-input
                style="width: 300px"
                outlined
                dense
                rounded
                v-model="pesquisa.searchParam"
                clearable
                placeholder="Filtrar Nome ou Telefone"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-grow text-right">
              <q-btn
                class="q-mr-sm"
                color="primary"
                rounded
                label="Gerar"
                icon="refresh"
                @click="listarAddContatos"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
      <q-card-section>
        <q-table
          class="my-sticky-dynamic q-ma-sm"
          style="height: 50vh"
          title="Contatos"
          id="tabela-contatos-campanha"
          :rows="contatosAdd"
          :columns="columnsAdd"
          :loading="loading"
          row-key="number"
          selection="multiple"
          v-model:selected="selected"
          v-model:pagination="pagination"
          :rows-per-page-options="[0]"
          separator="cell"
        >
          <template v-slot:top>
            <div class="row col-4 q-table__title items-center">Selecionar Contatos</div>
            <q-space />
            <q-btn
              rounded
              class="q-ml-md"
              color="negative"
              label="Cancelar"
              @click="emit('update:modelValue', false)"
            />
            <q-btn
              rounded
              class="q-ml-md"
              color="positive"
              icon="save"
              label="Adicionar"
              @click="addContatosCampanha"
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
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { format, sub } from 'date-fns'
import { estadoPorDdd, estadosBR } from 'src/utils/constants'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  etiquetas: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'added'])

const route = useRoute()
const $q = useQuasar()
const campanhaStore = useCampanhaStore()
const relatorioStore = useRelatorioStore()
const { adicionarContatosCampanha } = campanhaStore

const loading = ref(false)
const contatosAdd = ref([])
const selected = ref([])

const pesquisa = reactive({
  startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  ddds: [],
  tags: [],
  wallets: [],
  searchParam: ''
})

const pagination = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const columnsAdd = [
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
    format: v => {
      const ddd = v.substring(2, 4)
      return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
    }
  }
]

const listarAddContatos = async () => {
  try {
    loading.value = true
    const data = await relatorioStore.obterRelatorioContatos(pesquisa)
    if (pesquisa.tags.length > 0) {
      contatosAdd.value = data.contacts.filter(contact =>
        pesquisa.tags.every(tag => contact.tags.map(contactTag => contactTag.id).includes(tag))
      )
    } else {
      contatosAdd.value = data.contacts
    }
  } catch (error) {
    console.error(error)
    notificarErro('Erro ao listar contatos', error)
  } finally {
    loading.value = false
  }
}

const addContatosCampanha = async () => {
  if (selected.value.length > 2000) {
    notificarErro('O número máximo de contatos é 2000')
    return
  }
  try {
    await adicionarContatosCampanha(selected.value, route.params.campanhaId)
    emit('update:modelValue', false)
    emit('added')
    notificarSucesso('Contatos adicionados.')
  } catch (error) {
    console.error(error)
    notificarErro('Ocorreu um erro!', error)
  }
}

// Inicializar listagem ao abrir? Pode ser opcional.
</script>

<style lang="scss" scoped>
.unified-modal-color {
  background: #1e293b !important;
}

.unified-modal-color :deep(.q-card__section),
.unified-modal-color :deep(.q-table),
.unified-modal-color :deep(.q-table__container),
.unified-modal-color :deep(.q-table__middle),
.unified-modal-color :deep(.q-table__top),
.unified-modal-color :deep(.q-table__bottom),
.unified-modal-color :deep(.q-card__actions) {
  background: transparent !important;
}
</style>
