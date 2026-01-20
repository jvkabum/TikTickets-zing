<template>
  <div v-if="userProfile === 'admin'" class="q-pa-md">
    <ReportHeader
      title="Relatório de Contatos"
      subtitle="Filtro por data de criação do contato"
      :loading="loading"
      :show-period-filter="false"
      @refresh="gerarRelatorio"
      @print="printReport"
      @export="handleExport"
    />

    <q-card bordered flat class="q-mb-md">
      <q-card-section>
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
          <div class="col-auto">
            <q-btn
              rounded
              color="primary"
              label="Gerar"
              icon="refresh"
              @click="gerarRelatorio"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <ReportTable
      :rows="contatos"
      :columns="columns"
      :loading="loading"
      id="tRelatorioContatos"
    >
      <template v-slot:col-name="{ val }">
        <div class="text-bold">{{ val }}</div>
      </template>
    </ReportTable>

    <ccPrintModelLandscape
      id="slotTableRelatorioContatos"
      :imprimirRelatorio="imprimir"
      title="Relatório de Contatos"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.name">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in contatos" :key="row.id">
              <td v-for="col in columns" :key="col.name">
                {{ col.format ? col.format(row[col.field], row) : row[col.field] }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </ccPrintModelLandscape>
  </div>
</template>

<script setup>
import { format, subDays } from 'date-fns'
import * as XLSX from 'xlsx'

const {
  RelatorioContatos,
  loading
} = useRelatorios()

const userProfile = ref('user')
const contatos = ref([])
const imprimir = ref(false)

const replaceEmojis = str => {
  if (!str) return ''
  const ranges = ['[\u00A0-\u269f]', '[\u26A0-\u329f]', '[🀄-🧀]']
  return str.replace(new RegExp(ranges.join('|'), 'ug'), '')
}

const columns = [
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    format: v => replaceEmojis(v)
  },
  {
    name: 'number',
    label: 'WhatsApp',
    field: 'number',
    align: 'center'
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left'
  }
]

const pesquisa = reactive({
  startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd')
})

const printReport = () => {
  imprimir.value = !imprimir.value
}

const handleExport = (type) => {
  if (type === 'csv' || type === 'excel') {
    exportTable()
  } else if (type === 'pdf') {
    printReport()
  }
}

const exportTable = () => {
  const dataToExport = contatos.value.map(c => ({
    Nome: replaceEmojis(c.name),
    WhatsApp: c.number,
    Email: c.email
  }))
  
  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Contatos')
  XLSX.writeFile(wb, 'Relatorio-Contatos.xlsx')
}

const gerarRelatorio = async () => {
  try {
    const { data } = await RelatorioContatos(pesquisa)
    contatos.value = data.contacts
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  userProfile.value = localStorage.getItem('profile')
  gerarRelatorio()
})
</script>
