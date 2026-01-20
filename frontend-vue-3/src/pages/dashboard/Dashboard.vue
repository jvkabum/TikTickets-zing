<template>
  <div class="q-pa-sm">
    <q-card class="q-my-md">
      <q-card-section class="row justify-between items-center">
        <div class="col-xs-12 col-md-3 text-h4 text-bold text-center text-md-left">Painel de Controle</div>
        <div class="col-xs-12 col-md-9 justify-end flex q-gutter-sm text-center text-md-right q-my-md rdsPainelDate">
          <div class="q-mb-sm">
            <DatePick
              style="width: 200px"
              label="Data Inicial"
              v-model="params.startDate"
            />
          </div>
          <div class="q-mb-sm">
            <DatePick
              style="width: 200px"
              label="Data Final"
              v-model="params.endDate"
            />
          </div>
          <q-btn
            class="bg-padrao q-mb-sm"
            flat
            color="primary"
            icon="refresh"
            label="Gerar"
            @click="getDashData"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-my-md q-pa-sm">
      <q-card-section class="q-pa-md">
        <div class="row q-gutter-md justify-center">
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="min-width: 200px; background-color: #05d69e; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h4 text-bold text-center">
                  {{ ticketsAndTimes.qtd_total_atendimentos || 0 }}
                </p>
                <q-icon
                  name="verified"
                  size="lg"
                  color="white"
                  class="text-white"
                />
                Total Atendimentos
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="min-width: 200px; background-color: #faad42; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h4 text-bold text-center">
                  {{ ticketsAndTimes.qtd_demanda_ativa || 0 }}
                </p>
                <q-icon
                  name="mdi-comment-processing-outline"
                  size="lg"
                  color="white"
                  class="text-white"
                />
                Ativo
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="min-width: 200px; background-color: #0398e2; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h4 text-bold text-center">
                  {{ ticketsAndTimes.qtd_demanda_receptiva || 0 }}
                </p>
                <q-icon
                  name="mdi-arrow-left-bold"
                  size="lg"
                  color="white"
                  class="text-white"
                />
                Receptivo
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-shrink">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="min-width: 200px; background-color: #0398e2; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h4 text-bold text-center">
                  {{ ticketsAndTimes.new_contacts || 0 }}
                </p>
                <q-icon
                  name="mdi-contacts-outline"
                  size="lg"
                  color="white"
                  class="text-white"
                />
                Novos Contatos
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="background-color: #ffa880; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h5 text-bold text-center">
                  <q-icon
                    name="mdi-clock-outline"
                    size="lg"
                    color="white"
                    class="text-white"
                  />
                  {{ cTmaFormat }}
                </p>
                Tempo Médio de Atendimento (TMA)
              </q-card-section>
            </q-card>
          </div>
          <div class="col-xs-12 col-sm-4 col-md-3 col-lg-2">
            <q-card
              flat
              bordered
              class="my-card full-height"
              style="background-color: #fc5881ff; color: white"
            >
              <q-card-section class="text-center">
                <p class="text-h5 text-bold text-center">
                  <q-icon
                    name="mdi-timer-sand"
                    size="lg"
                    color="white"
                    class="text-white"
                  />
                  {{ cTmeFormat }}
                </p>
                Tempo Médio 1º Resposta
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <apexchart
              ref="ChartTicketsChannels"
              type="pie"
              height="300"
              width="100%"
              :options="ticketsChannelsOptions"
              :series="ticketsChannelsOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section class="q-pa-md">
            <apexchart
              ref="ChartTicketsQueue"
              type="pie"
              height="300"
              width="100%"
              :options="ticketsQueueOptions"
              :series="ticketsQueueOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="q-my-md">
      <q-card-section>
        <apexchart
          ref="ChartTicketsEvolutionChannels"
          type="bar"
          height="300"
          width="100%"
          :options="ticketsEvolutionChannelsOptions"
          :series="ticketsEvolutionChannelsOptions.series"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-my-md">
      <q-card-section class="q-pa-md">
        <apexchart
          ref="ChartTicketsEvolutionByPeriod"
          type="line"
          height="300"
          :options="ticketsEvolutionByPeriodOptions"
          :series="ticketsEvolutionByPeriodOptions.series"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-my-md q-pa-sm">
      <q-card-section class="q-pa-md">
        <q-table
          title="Performance Usuários"
          :rows="ticketsPerUsersDetail"
          :columns="TicketsPerUsersDetailColumn"
          row-key="email"
          v-model:pagination="paginationTableUser"
          :rows-per-page-options="[0]"
          bordered
          flat
          hide-bottom
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="row col text-bold">
                {{ props.row.name || 'Não informado' }}
              </div>
              <div class="row col text-caption">{{ props.row.email }}</div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { format, formatDuration, subDays } from 'date-fns'
import groupBy from 'lodash/groupBy'
import DatePick from 'src/components/cDatePick.vue'

const $q = useQuasar()
const router = useRouter()

const params = reactive({
  startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  queuesIds: [],
  isGroup: false
})

const ChartTicketsQueue = ref(null)
const ChartTicketsChannels = ref(null)
const ChartTicketsEvolutionChannels = ref(null)
const ChartTicketsEvolutionByPeriod = ref(null)

const ticketsQueueOptions = ref({
  chart: { type: 'pie', height: 300 },
  labels: [],
  series: [],
  legend: { position: 'bottom' },
  theme: {}
})

const ticketsChannelsOptions = ref({
  chart: { type: 'pie', height: 300 },
  labels: [],
  series: [],
  legend: { position: 'bottom' },
  theme: {}
})

const ticketsEvolutionByPeriodOptions = ref({
  chart: { type: 'line', height: 300 },
  labels: [],
  series: [],
  legend: { position: 'bottom' },
  xaxis: { type: 'category' },
  theme: {}
})

const ticketsEvolutionChannelsOptions = ref({
  chart: { type: 'bar', height: 300, stacked: false, toolbar: { show: false } },
  grid: { show: false },
  stroke: { width: [4, 4, 4] },
  colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
  xaxis: { categories: [] },
  yaxis: { title: { text: 'Atendimentos' } },
  tooltip: { shared: true, intersect: false },
  legend: { position: 'top', horizontalAlign: 'left', offsetX: 40 },
  series: [],
  theme: {}
})

const paginationTableUser = ref({
  rowsPerPage: 40,
  rowsNumber: 0,
  lastIndex: 0
})

const TicketsPerUsersDetailColumn = [
  { name: 'name', label: 'Usuário', field: 'name', align: 'left' },
  { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
  {
    name: 'qtd_total_atendimentos',
    label: 'Total Atendimentos',
    field: 'qtd_total_atendimentos',
    align: 'center'
  },
  {
    name: 'tma',
    label: 'TMA',
    field: 'tma',
    align: 'center',
    format: val => (val ? formatDuration(val) : '')
  },
  {
    name: 'tme',
    label: 'TME',
    field: 'tme',
    align: 'center',
    format: val => (val ? formatDuration(val) : '')
  }
]

const cTmaFormat = computed(() => formatDuration(ticketsAndTimes.value.tma || {}) || '')
const cTmeFormat = computed(() => formatDuration(ticketsAndTimes.value.tme || {}) || '')

const filaStore = useFilaStore()
const { filas } = storeToRefs(filaStore)

const {
  ticketsAndTimes,
  ticketsQueue,
  ticketsChannels,
  ticketsEvolutionChannels,
  ticketsEvolutionByPeriod,
  ticketsPerUsersDetail,
  obterDashTicketsAndTimes,
  obterDashTicketsQueue,
  obterDashTicketsChannels,
  obterDashTicketsEvolutionChannels,
  obterDashTicketsEvolutionByPeriod,
  obterDashTicketsPerUsersDetail
} = useRelatorios()

const getDashData = () => {
  obterDashTicketsAndTimes(params)
  obterDashTicketsChannels(params)
  obterDashTicketsEvolutionChannels(params)
  obterDashTicketsQueue(params)
  obterDashTicketsEvolutionByPeriod(params)
  obterDashTicketsPerUsersDetail(params)
}

watch(ticketsQueue, (data) => {
    ticketsQueueOptions.value.series = data.map(e => +e.qtd)
    ticketsQueueOptions.value.labels = data.map(e => e.label)
})

watch(ticketsChannels, (data) => {
    ticketsChannelsOptions.value.series = data.map(e => +e.qtd)
    ticketsChannelsOptions.value.labels = data.map(e => e.label)
})

watch(ticketsEvolutionChannels, (data) => {
    const dataLabel = groupBy({ ...data }, 'dt_referencia')
    const labels = Object.keys(dataLabel)
    ticketsEvolutionChannelsOptions.value.labels = labels
    ticketsEvolutionChannelsOptions.value.xaxis.categories = labels
    const series = []
    const dados = groupBy({ ...data }, 'label')
    for (const item in dados) {
      series.push({ name: item, data: dados[item].map(d => d.qtd) })
    }
    ticketsEvolutionChannelsOptions.value.series = series
})

watch(ticketsEvolutionByPeriod, (data) => {
    const series = [
      { name: 'Atendimentos', type: 'column', data: data.map(e => +e.qtd) },
      { name: 'Tendência', type: 'line', data: data.map(e => +e.qtd) }
    ]
    const labels = data.map(e => e.label)
    ticketsEvolutionByPeriodOptions.value.labels = labels
    ticketsEvolutionByPeriodOptions.value.series = series
})

const listarFilas = async () => {
  await filaStore.listarFilas()
}

watch(
  () => $q.dark.isActive,
  () => {
    router.go()
  }
)

onMounted(() => {
  const mode = $q.dark.isActive ? 'dark' : 'light'
  const theme = {
    mode,
    palette: 'palette1',
    monochrome: {
      enabled: true,
      color: '#0288d1',
      shadeTo: mode,
      shadeIntensity: 0.95
    }
  }
  ticketsQueueOptions.value.theme = theme
  ticketsChannelsOptions.value.theme = theme
  ticketsEvolutionChannelsOptions.value.theme = theme
  ticketsEvolutionByPeriodOptions.value.theme = theme
  listarFilas()
  getDashData()
})
</script>

<style lang="scss">
.apexcharts-theme-dark svg {
  background: none !important;
}
</style>
