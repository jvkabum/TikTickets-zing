<template>
  <q-page class="q-pa-lg">
    <!-- Header Flutuante / Toolbar Premium -->
    <transition
      appear
      enter-active-class="animated fadeInDown"
    >
      <q-card class="q-mb-xl glass-premium shadow-2 rdsPainelDate overflow-hidden" style="border-radius: 24px">
        <q-card-section class="row justify-between items-center q-py-md">
          <div class="col-xs-12 col-md-4">
            <div class="text-h4 text-weight-bolder text-primary tracking-tight">
              Dashboard
              <q-badge align="top" color="primary" class="q-ml-sm" outline>BETA</q-badge>
            </div>
            <div class="text-caption text-grey-8">Visão geral e performance operacional</div>
          </div>
          
          <div class="col-xs-12 col-md-8 justify-end flex q-gutter-md q-pt-md q-md-pt-none">
            <DatePick
              style="width: 180px"
              v-model="params.startDate"
              dense
            />
            <DatePick
              style="width: 180px"
              v-model="params.endDate"
              dense
            />
            <q-btn
              class="grad-primary"
              unelevated
              padding="12px 24px"
              icon="refresh"
              label="Atualizar"
              @click="getDashData"
              style="border-radius: 12px"
            />
          </div>
        </q-card-section>
      </q-card>
    </transition>

    <!-- Grade de Estatísticas Principais -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div v-for="(card, index) in statCards" :key="index" class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
        <transition
          appear
          enter-active-class="animated zoomIn"
          :duration="300 + (index * 100)"
        >
          <StatCard
            v-bind="card"
            class="full-height"
          />
        </transition>
      </div>
    </div>

    <!-- Gráficos de Pizza em Linha -->
    <div class="row q-col-gutter-xl q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <q-card class="glass-premium no-shadow hover-premium" style="border-radius: 20px">
          <q-card-section class="q-pa-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Atendimentos por Canal</div>
            <apexchart
              ref="ChartTicketsChannels"
              type="donut"
              height="320"
              width="100%"
              :options="ticketsChannelsOptions"
              :series="ticketsChannelsOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-card class="glass-premium no-shadow hover-premium" style="border-radius: 20px">
          <q-card-section class="q-pa-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Atendimentos por Fila</div>
            <apexchart
              ref="ChartTicketsQueue"
              type="donut"
              height="320"
              width="100%"
              :options="ticketsQueueOptions"
              :series="ticketsQueueOptions.series"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráfico de Evolução de Canais (Destaque Central) -->
    <q-card class="q-mb-xl glass-premium no-shadow hover-premium overflow-hidden" style="border-radius: 28px">
      <q-card-section class="q-pa-lg">
        <div class="row items-center q-mb-lg">
          <q-icon name="mdi-chart-timeline-variant" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Evolução dos Canais</div>
        </div>
        <apexchart
          :key="evolutionKey"
          ref="ChartTicketsEvolutionChannels"
          type="line"
          height="350"
          width="100%"
          :options="ticketsEvolutionChannelsOptions"
          :series="ticketsEvolutionChannelsOptions.series"
        />
      </q-card-section>
    </q-card>

    <!-- Gráfico de Evolução por Período -->
    <q-card class="q-mb-xl glass-premium no-shadow hover-premium" style="border-radius: 28px">
      <q-card-section class="q-pa-lg">
        <div class="row items-center q-mb-lg">
          <q-icon name="mdi-trending-up" color="secondary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">Atendimentos por Período</div>
        </div>
        <apexchart
          :key="evolutionByPeriodKey"
          ref="ChartTicketsEvolutionByPeriod"
          type="line"
          height="350"
          :options="ticketsEvolutionByPeriodOptions"
          :series="ticketsEvolutionByPeriodOptions.series"
        />
      </q-card-section>
    </q-card>

    <!-- Tabela de Performance de Usuários -->
    <q-card class="glass-premium no-shadow" style="border-radius: 28px; border: 1px solid rgba(255,255,255,0.4)">
      <q-card-section class="q-pa-lg">
        <div class="row items-center q-mb-xl">
          <div class="grad-primary rounded-all q-pa-sm q-mr-md" style="width: 42px; height: 42px; border-radius: 12px">
            <q-icon name="mdi-account-star" color="white" size="24px" />
          </div>
          <div>
            <div class="text-h6 text-weight-bold">Performance do Time</div>
            <div class="text-caption text-grey-7">Métricas individuais por consultor</div>
          </div>
        </div>

        <q-table
          :rows="ticketsPerUsersDetail"
          :columns="TicketsPerUsersDetailColumn"
          row-key="email"
          v-model:pagination="paginationTableUser"
          :rows-per-page-options="[0]"
          flat
          class="bg-transparent"
          hide-bottom
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-primary text-white rounded-all overflow-hidden" style="border-radius: 12px">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-uppercase"
                style="font-size: 11px; letter-spacing: 1px"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="32px" class="grad-info text-white text-weight-bold q-mr-sm">
                  {{ props.row.name ? props.row.name.charAt(0) : '?' }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold text-primary">{{ props.row.name || 'Não informado' }}</div>
                  <div class="text-caption text-grey-6">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>
          
          <template v-slot:body-cell-qtd_total_atendimentos="props">
            <q-td :props="props">
              <div class="column" style="min-width: 140px">
                <div class="row items-center justify-between q-mb-xs">
                  <q-badge color="blue-1" text-color="blue-10" class="q-pa-xs text-weight-bold" style="border-radius: 6px">
                    {{ props.value }}
                  </q-badge>
                  <div class="text-caption text-grey-6 text-weight-bold">{{ Math.min(Math.round((props.value / 100) * 100), 100) }}%</div>
                </div>
                <q-linear-progress 
                  :value="Math.min(props.value / 100, 1)" 
                  color="primary" 
                  track-color="grey-2" 
                  class="rounded-all" 
                  style="height: 6px" 
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { format, formatDuration, subDays } from 'date-fns'
import groupBy from 'lodash/groupBy'

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
const evolutionKey = ref(0)
const evolutionByPeriodKey = ref(0)
const ChartTicketsEvolutionByPeriod = ref(null)

const ticketsQueueOptions = ref({
  chart: { 
    type: 'donut', 
    height: 320, 
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  labels: [],
  series: [],
  legend: { position: 'bottom', horizontalAlign: 'center', fontFamily: 'Nunito' },
  stroke: { show: false },
  colors: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e'],
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: { 
        size: '75%',
        background: 'transparent',
        labels: {
          show: true,
          name: { show: true, fontSize: '14px', fontFamily: 'Nunito', color: '#64748b' },
          value: { show: true, fontSize: '24px', fontWeight: 800, fontFamily: 'Nunito', color: '#1e293b' },
          total: {
            show: true,
            label: 'Total',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 600,
            formatter: (w) => {
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: "diagonal1",
      shadeIntensity: 0.2,
      opacityFrom: 1,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  },
  theme: { mode: 'light' }
})

const ticketsChannelsOptions = ref({
  chart: { 
    type: 'donut', 
    height: 320,
    toolbar: { show: false }
  },
  stroke: { show: false },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, fontSize: '14px', fontFamily: 'Nunito', color: '#64748b' },
          value: { show: true, fontSize: '24px', fontWeight: 800, fontFamily: 'Nunito', color: '#1e293b' },
          total: {
            show: true,
            label: 'Total',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 600,
            formatter: (w) => ticketsAndTimes.value.qtd_total_atendimentos || 0
          }
        }
      }
    }
  },
  labels: [],
  series: [],
  tooltip: {
    enabled: true,
    theme: 'light',
    style: { fontSize: '13px', fontFamily: 'Nunito' },
    y: {
      formatter: (val) => val + " atendimentos",
      title: { formatter: (seriesName) => seriesName + ':' }
    }
  },
  theme: { mode: 'light' }
})

const ticketsEvolutionByPeriodOptions = ref({
  chart: { 
    type: 'line', 
    height: 350, 
    toolbar: { show: false }
  },
  colors: ['#6366f1'],
  stroke: { curve: 'smooth', width: 6, lineCap: 'round' },
  markers: { 
    size: 7,
    colors: ['#fff'],
    strokeColors: '#6366f1',
    strokeWidth: 4,
    hover: { size: 9, strokeWidth: 5 }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 3,
    padding: { left: 20, right: 20 }
  },
  xaxis: { 
    type: 'category',
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b', fontWeight: 600 } }
  },
  yaxis: {
    labels: { style: { colors: '#64748b', fontWeight: 600 } }
  },
  tooltip: { 
    shared: true, 
    intersect: false,
    theme: 'light',
    style: { fontSize: '13px', fontFamily: 'Nunito' },
    y: {
      formatter: (val) => val + " total"
    }
  },
  series: [],
  theme: { mode: 'light' }
})

const ticketsEvolutionChannelsOptions = ref({
  chart: { 
    type: 'area', 
    height: 350, 
    stacked: true, 
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 4 },
  markers: { 
    size: 5,
    strokeWidth: 3,
    strokeColors: '#fff',
    hover: { size: 7 }
  },
  tooltip: { 
    shared: true, 
    intersect: false,
    theme: 'light',
    style: { fontSize: '13px', fontFamily: 'Nunito' },
    marker: { show: true },
    x: { show: true }
  },
  legend: { position: 'top', horizontalAlign: 'left', fontFamily: 'Nunito', fontWeight: 600 },
  series: [],
  theme: { mode: 'light' }
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

const cTmaFormat = computed(() => formatDuration(ticketsAndTimes.value.tma || {}) || '0s')
const cTmeFormat = computed(() => formatDuration(ticketsAndTimes.value.tme || {}) || '0s')

const statCards = computed(() => [
  {
    label: 'Total Atendimentos',
    value: ticketsAndTimes.value.qtd_total_atendimentos || 0,
    description: '12% maior que os últimos 7 dias',
    icon: 'verified',
    color: 'success',
    trend: 12,
    progressValue: 0.85
  },
  {
    label: 'Ativo',
    value: ticketsAndTimes.value.qtd_demanda_ativa || 0,
    description: 'Ação proativa do time',
    icon: 'mdi-comment-processing-outline',
    color: 'warning',
    trend: -5,
    progressValue: 0.45
  },
  {
    label: 'Receptivo',
    value: ticketsAndTimes.value.qtd_demanda_receptiva || 0,
    description: 'Fluxo de entrada estável',
    icon: 'mdi-arrow-left-bold',
    color: 'info',
    trend: 8,
    progressValue: 0.65
  },
  {
    label: 'Novos Contatos',
    value: ticketsAndTimes.value.new_contacts || 0,
    description: 'Novas oportunidades hoje',
    icon: 'mdi-contacts-outline',
    color: 'primary',
    trend: 0,
    progressValue: 0.3
  },
  {
    label: 'T.M.A',
    value: cTmaFormat.value,
    description: 'Tempo médio de atendimento',
    icon: 'mdi-clock-outline',
    color: 'warning',
    formatType: 'text',
    progressValue: 0.55
  },
  {
    label: 'T.M.E',
    value: cTmeFormat.value,
    description: 'Tempo médio de espera',
    icon: 'mdi-timer-sand',
    color: 'error',
    formatType: 'text',
    progressValue: 0.9 // Representa urgência se estiver alto
  }
])

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
    if (!data) return
    ticketsQueueOptions.value = {
      ...ticketsQueueOptions.value,
      series: data.map(e => +e.qtd),
      labels: data.map(e => e.label)
    }
})

watch(ticketsChannels, (data) => {
    if (!data) return
    ticketsChannelsOptions.value = {
      ...ticketsChannelsOptions.value,
      series: data.map(e => +e.qtd),
      labels: data.map(e => e.label)
    }
})

watch(ticketsEvolutionChannels, (data) => {
    if (!data || data.length === 0) return
    
    // 1. Agrupar dados por data (usando array puro para evitar proxy bugs)
    const rawData = Array.isArray(data) ? data : Object.values(data)
    const dataLabel = groupBy(rawData, 'dt_referencia')
    
    let labels = Object.keys(dataLabel).sort((a, b) => {
      const [da, ma, ya] = a.split('/')
      const [db, mb, yb] = b.split('/')
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db)
    })
    
    const canais = [...new Set(rawData.map(d => d.label))]
    
    // 2. Padding para 1 dia
    const paddingData = []
    if (labels.length === 1) {
      const [d, m, y] = labels[0].split('/')
      const current = new Date(y, m - 1, d)
      
      const yesterday = new Date(current)
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date(current)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const yesterdayStr = format(yesterday, 'dd/MM/yyyy')
      const tomorrowStr = format(tomorrow, 'dd/MM/yyyy')
      
      const originalLabels = labels
      labels = [yesterdayStr, ...originalLabels, tomorrowStr]
      
      canais.forEach(canal => {
        paddingData.push({ label: canal, dt_referencia: yesterdayStr, qtd: 0 })
        paddingData.push({ label: canal, dt_referencia: tomorrowStr, qtd: 0 })
      })
    }

    const combinedData = [...paddingData, ...rawData]
    
    // 3. Montar séries
    const series = canais.map(canal => {
      const dataForCanal = labels.map(dataRef => {
        const item = combinedData.find(d => d.label === canal && d.dt_referencia === dataRef)
        return item ? Number(item.qtd) : 0
      })
      return { name: canal, data: dataForCanal }
    })

    // 4. Force Redraw
    ticketsEvolutionChannelsOptions.value = {
      ...ticketsEvolutionChannelsOptions.value,
      xaxis: {
        ...ticketsEvolutionChannelsOptions.value.xaxis,
        categories: labels
      },
      series: series
    }
    evolutionKey.value++
})

watch(ticketsEvolutionByPeriod, (data) => {
    if (!data || data.length === 0) return
    const rawData = Array.isArray(data) ? data : Object.values(data)
    
    let labels = rawData.map(e => e.label)
    let finalData = rawData
    
    // Padding para 1 dia
    if (labels.length === 1) {
      const currentStr = labels[0]
      const [d, m, y] = currentStr.split('/')
      const current = new Date(y, m - 1, d)
      
      const yesterday = new Date(current)
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date(current)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const yesterdayStr = format(yesterday, 'dd/MM/yyyy')
      const tomorrowStr = format(tomorrow, 'dd/MM/yyyy')
      
      labels = [yesterdayStr, currentStr, tomorrowStr]
      finalData = [
        { label: yesterdayStr, qtd: 0 },
        ...rawData,
        { label: tomorrowStr, qtd: 0 }
      ]
    }
    
    const series = [
      { name: 'Atendimentos', data: finalData.map(e => +e.qtd) }
    ]
    
    ticketsEvolutionByPeriodOptions.value = {
      ...ticketsEvolutionByPeriodOptions.value,
      xaxis: {
        ...ticketsEvolutionByPeriodOptions.value.xaxis,
        categories: labels
      },
      series: series
    }
    evolutionByPeriodKey.value++
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
      enabled: false
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

<style lang="scss" scoped>
.q-page {
  background: radial-gradient(circle at top right, rgba(var(--q-primary), 0.05), transparent),
              radial-gradient(circle at bottom left, rgba(var(--q-secondary), 0.05), transparent);
  min-height: 100vh;
}

.tracking-tight {
  letter-spacing: -1px;
}

:deep(.apexcharts-canvas) {
  margin: 0 auto;
}

:deep(.q-table__card) {
  background: transparent !important;
}

.hover-premium {
  &:hover {
    border: 1px solid rgba(var(--q-primary), 0.2) !important;
  }
}
</style>
