<template>
  <div v-if="userProfile === 'admin'">
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm">Relatório de Contatos por Estado</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-xs-12 col-sm-7 grow text-center">
              <q-select
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
                <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps">
                    <q-item-section>
                      <q-item-label v-text="opt.nome" />
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
            <div class="col-grow text-center">
              <q-btn
                class="q-mr-sm"
                color="primary"
                rounded
                label="Gerar"
                icon="refresh"
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                rounded
                icon="print"
                label="Imprimir"
                @click="printReport"
              />
              <q-btn
                color="warning"
                rounded
                label="Excel"
                @click="exportTable"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
    </q-card>

    <div class="row">
      <div class="col-xs-12 q-mt-sm">
        <div
          class="tableLarge q-ma-sm q-markup-table q-table__container q-table__card q-table--cell-separator q-table--flat q-table--bordered q-table--no-wrap"
          id="tRelatorioContatosEtiquetas"
        >
          <table
            id="tableRelatorioContatos"
            class="q-pb-md q-table q-tabs--dense"
          >
            <thead>
              <tr>
                <td
                  v-for="col in columns"
                  :key="col.name"
                  :style="col.style"
                >
                  {{ col.label }}
                </td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in contatos"
                :key="row.number"
              >
                <td
                  v-for="col in columns"
                  :key="col.name + '-' + row.id"
                  :class="col.class"
                  :style="col.style"
                >
                  {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ccPrintModelLandscape
      id="slotTableRelatorioContatos"
      :imprimirRelatorio="imprimir"
      title="Relatório de Contatos por Estado"
      :styleP="`
      table { width: 100%; font-size: 10px; border-spacing: 1; border-collapse: collapse;  }
      #tableReport tr td { border:1px solid #DDD; padding-left: 10px; padding-right: 10px;  }
      #tableReport thead tr:nth-child(1) td { text-align: center; padding: 5px; font-weight: bold; color: #000; background: lightgrey; opacity: 1; }
      #lineGroup { background: #f8f8f8; line-height: 30px; }
      #quebraAgrupamentoRelatorio { border-bottom: 1px solid black !important; }
      #st_nome, #st_tipo_atendimento, #st_status_faturamento, #st_convenio, #st_nome_profissional, #st_status, #st_nome_unidade, #st_nome_profissional { width: 200px; word-wrap: normal !important; white-space: normal !important; }
      #dt_atendimento_unidade { width: 100px; text-align: center }
      `"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table q-tabs--dense">
          <thead>
            <tr>
              <td
                v-for="col in columns"
                :key="col.name"
              >
                {{ col.label }}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in contatos"
              :key="row.number"
            >
              <td
                v-for="col in columns"
                :key="col.name + '-' + row.id"
                :class="col.class"
                :style="col.style"
              >
                {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </ccPrintModelLandscape>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { RelatorioContatos } from 'src/service/estatisticas'
import { estadoPorDdd, estadosBR } from 'src/utils/constants'
import { onMounted, reactive, ref } from 'vue'
import * as XLSX from 'xlsx'

const props = defineProps({
  moduloAtendimento: {
    type: Boolean,
    default: false
  }
})

const $q = useQuasar()
const userProfile = ref('user')
const contatos = ref([])
const imprimir = ref(false)

const replaceEmojis = str => {
  if (!str) return ''
  const ranges = ['[\u00A0-\u269f]', '[\u26A0-\u329f]', '[🀄-🧀]']
  return str.replace(new RegExp(ranges.join('|'), 'ug'), '')
}

const definirEstadoNumero = numero => {
  if (!numero) return ''
  const ddd = numero.substring(2, 4)
  return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
}

const columns = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    style: 'width: 300px',
    format: v => replaceEmojis(v)
  },
  {
    name: 'number',
    label: 'WhatsApp',
    field: 'number',
    align: 'center',
    style: 'width: 300px'
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    style: 'width: 500px',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'number',
    style: 'width: 500px',
    align: 'left',
    format: v => definirEstadoNumero(v)
  }
]

const pesquisa = reactive({
  ddds: []
})

const printReport = () => {
  imprimir.value = !imprimir.value
}

const exportTable = () => {
  const table = document.getElementById('tableRelatorioContatos')
  const json = XLSX.utils.table_to_sheet(table, { raw: true })

  for (const col in json) {
    if (col[0] === 'J') {
      json[col].t = 'n'
      json[col].v = json[col].v.replace(/\./g, '').replace(',', '.')
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, json, 'Relatório Contatos')
  XLSX.writeFile(wb, 'Relatorio-Contatos-Estado.xlsx')
}

const gerarRelatorio = async () => {
  if (!pesquisa.ddds.length) {
    $q.notify({
      message: 'Ops... Para gerar o relatório, é necessário selecionar pelo menos um Estado.',
      type: 'negative',
      position: 'top'
    })
    return
  }
  try {
    const { data } = await RelatorioContatos(pesquisa)
    contatos.value = data.contacts
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
})
</script>

<style scoped>
.text-right {
  text-align: right;
}

thead tr:nth-child(1) td {
  color: #000;
  background: grey;
  position: sticky;
  opacity: 1;
  top: 0;
  z-index: 1000;
}

.tableSmall {
  max-height: calc(100vh - 130px);
  height: calc(100vh - 130px);
}

.tableLarge {
  max-height: calc(100vh - 220px);
  height: calc(100vh - 220px);
}
</style>
