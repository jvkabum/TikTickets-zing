<template>
  <q-page class="q-pa-lg" v-show="!isLeavingPage">
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
              <q-badge align="top" color="primary" class="q-ml-sm" :outline="!$q.dark.isActive">BETA</q-badge>
            </div>
            <div class="text-caption text-grey-8" :class="{ 'text-grey-5': $q.dark.isActive }">Visão geral e performance operacional</div>
          </div>
          
          <div class="col-xs-12 col-md-8 justify-end flex items-center q-gutter-md q-pt-md q-md-pt-none">
            <DatePick
              style="width: 170px"
              v-model="params.startDate"
              dense
              :dark="$q.dark.isActive"
            />
            <DatePick
              style="width: 170px"
              v-model="params.endDate"
              dense
              :dark="$q.dark.isActive"
            />
            <q-btn
              class="grad-primary shadow-neon text-white"
              unelevated
              icon="refresh"
              label="Atualizar"
              @click="getDashData"
              style="border-radius: 10px; height: 40px; font-weight: bold"
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
            <div class="text-subtitle1 text-weight-bold q-mb-md text-dark-theme">Atendimentos por Canal</div>
            <apexchart
              :key="`channels-${$q.dark.isActive}`"
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
            <div class="text-subtitle1 text-weight-bold q-mb-md text-dark-theme">Atendimentos por Fila</div>
            <apexchart
              :key="`queue-${$q.dark.isActive}`"
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
          <div class="text-h6 text-weight-bold text-dark-theme">Evolução dos Canais</div>
        </div>
        <apexchart
          :key="`evolution-${$q.dark.isActive}`"
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
          <div class="text-h6 text-weight-bold text-dark-theme">Atendimentos por Período</div>
        </div>
        <apexchart
          :key="`period-${$q.dark.isActive}`"
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
            <div class="text-h6 text-weight-bold text-dark-theme">Performance do Time</div>
            <div class="text-caption text-grey-7" :class="{ 'text-grey-5': $q.dark.isActive }">Métricas individuais por consultor</div>
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
          :dark="$q.dark.isActive"
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
                  <q-badge :color="$q.dark.isActive ? 'blue-9' : 'blue-1'" :text-color="$q.dark.isActive ? 'white' : 'blue-10'" class="q-pa-xs text-weight-bold" style="border-radius: 6px">
                    {{ props.value }}
                  </q-badge>
                  <div class="text-caption text-weight-bold" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">{{ Math.min(Math.round((props.value / 100) * 100), 100) }}%</div>
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
import { computed, reactive, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { format, formatDuration, subDays } from 'date-fns'
import groupBy from 'lodash/groupBy'
import { useRelatorioStore } from 'src/stores/useRelatorioStore'
import { useFilaStore } from 'src/stores/useFilaStore'
import { useRelatorios } from 'src/composables/useRelatorios'

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

const baseChartOptions = computed(() => ({
    chart: { 
        background: 'transparent',
        toolbar: { show: false },
        fontFamily: 'Nunito, sans-serif',
        foreColor: $q.dark.isActive ? '#94a3b8' : '#64748b',
        animations: { enabled: false }, // Desabilita animações para melhor performance
        redrawOnParentResize: false,
        redrawOnWindowResize: false
    },
    theme: {
        mode: $q.dark.isActive ? 'dark' : 'light',
        palette: 'palette1'
    },
    grid: { 
      borderColor: $q.dark.isActive ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      strokeDashArray: 4
    },
    tooltip: {
      theme: $q.dark.isActive ? 'dark' : 'light'
    }
}))

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
  obterDashTicketsPerUsersDetail,
  cancelarConsultas
} = useRelatorios()

const isLeavingPage = ref(false)

// Cancelar requisições ANTES de sair da página (mais rápido que onBeforeUnmount)
onBeforeRouteLeave(() => {
  // Esconder Dashboard IMEDIATAMENTE via CSS (sem esperar destruição)
  isLeavingPage.value = true
  
  cancelarConsultas()
  
  // Destruir gráficos em background (async)
  setTimeout(() => {
    try {
      ChartTicketsQueue.value?.chart?.destroy()
      ChartTicketsChannels.value?.chart?.destroy()
      ChartTicketsEvolutionChannels.value?.chart?.destroy()
      ChartTicketsEvolutionByPeriod.value?.chart?.destroy()
    } catch (e) {
      // Ignorar erros
    }
  }, 0)
  
  return true // Permitir navegação imediatamente
})

onMounted(() => {
  listarFilas()
  getDashData()
})

onBeforeUnmount(() => {
  cancelarConsultas()
})

const ticketsQueueOptions = computed(() => ({
  ...baseChartOptions.value,
  chart: { 
    ...baseChartOptions.value.chart,
    type: 'donut', 
    height: 320, 
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  labels: ticketsQueue.value.map(e => e.label),
  series: ticketsQueue.value.map(e => +e.qtd),
  legend: { 
    position: 'bottom', 
    horizontalAlign: 'center', 
    fontFamily: 'Nunito',
    labels: {
      colors: $q.dark.isActive ? '#94a3b8' : '#64748b'
    }
  },
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
          name: { show: true, fontSize: '14px', fontFamily: 'Nunito', color: $q.dark.isActive ? '#94a3b8' : '#64748b' },
          value: { show: true, fontSize: '24px', fontWeight: 800, fontFamily: 'Nunito', color: $q.dark.isActive ? '#f1f5f9' : '#1e293b' },
          total: {
            show: true,
            label: 'Total',
            color: $q.dark.isActive ? '#94a3b8' : '#64748b',
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
      shade: $q.dark.isActive ? 'dark' : 'light',
      type: "diagonal1",
      shadeIntensity: 0.2,
      opacityFrom: 1,
      opacityTo: 0.9,
      stops: [0, 90, 100]
    }
  }
}))

const ticketsChannelsOptions = computed(() => ({
  ...baseChartOptions.value,
  chart: { 
    ...baseChartOptions.value.chart,
    type: 'donut', 
    height: 320
  },
  stroke: { show: false },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, fontSize: '14px', fontFamily: 'Nunito', color: $q.dark.isActive ? '#94a3b8' : '#64748b' },
          value: { show: true, fontSize: '24px', fontWeight: 800, fontFamily: 'Nunito', color: $q.dark.isActive ? '#f1f5f9' : '#1e293b' },
          total: {
            show: true,
            label: 'Total',
            color: $q.dark.isActive ? '#94a3b8' : '#64748b',
            fontSize: '14px',
            fontWeight: 600,
            formatter: (w) => ticketsAndTimes.value.qtd_total_atendimentos || 0
          }
        }
      }
    }
  },
  labels: ticketsChannels.value.map(e => e.label),
  series: ticketsChannels.value.map(e => +e.qtd),
  legend: { 
    position: 'bottom', 
    horizontalAlign: 'center', 
    fontFamily: 'Nunito',
    labels: {
      colors: $q.dark.isActive ? '#94a3b8' : '#64748b'
    }
  },
  tooltip: {
    ...baseChartOptions.value.tooltip,
    enabled: true,
    y: {
      formatter: (val) => val + " atendimentos",
      title: { formatter: (seriesName) => seriesName + ':' }
    }
  }
}))

const ticketsEvolutionByPeriodOptions = computed(() => {
    const rawData = Array.isArray(ticketsEvolutionByPeriod.value) ? ticketsEvolutionByPeriod.value : []
    
    let labels = rawData.map(e => e.label)
    let finalData = rawData
    
    // Padding para 1 dia (Efeito Montanha)
    if (labels.length === 1) {
      const [d, m, y] = labels[0].split('/')
      const current = new Date(y, m - 1, d)
      const yesterday = new Date(current)
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date(current)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const yesterdayStr = format(yesterday, 'dd/MM/yyyy')
      const tomorrowStr = format(tomorrow, 'dd/MM/yyyy')
      
      labels = [yesterdayStr, labels[0], tomorrowStr]
      finalData = [
        { label: yesterdayStr, qtd: 0 },
        ...rawData,
        { label: tomorrowStr, qtd: 0 }
      ]
    }
    
    return {
      ...baseChartOptions.value,
      chart: { 
        ...baseChartOptions.value.chart,
        type: 'line', 
        height: 350
      },
      colors: ['#6366f1'],
      stroke: { curve: 'smooth', width: 6, lineCap: 'round' },
      markers: { 
        size: 7,
        colors: [ $q.dark.isActive ? '#1e293b' : '#fff' ],
        strokeColors: '#6366f1',
        strokeWidth: 4,
        hover: { size: 9, strokeWidth: 5 }
      },
      xaxis: { 
        ...baseChartOptions.value.xaxis,
        type: 'category',
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        ...baseChartOptions.value.yaxis
      },
      tooltip: { 
        ...baseChartOptions.value.tooltip,
        shared: true, 
        intersect: false,
        y: {
          formatter: (val) => val + " total"
        }
      },
      series: [{ name: 'Atendimentos', data: finalData.map(e => +e.qtd) }]
    }
})

const ticketsEvolutionChannelsOptions = computed(() => {
    const data = ticketsEvolutionChannels.value || []
    const rawData = Array.isArray(data) ? data : Object.values(data)
    const dataLabel = groupBy(rawData, 'dt_referencia')
    
    let labels = Object.keys(dataLabel).sort((a, b) => {
      const [da, ma, ya] = a.split('/')
      const [db, mb, yb] = b.split('/')
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db)
    })
    
    const canais = [...new Set(rawData.map(d => d.label))]
    
    // Padding para garantir visibilidade de 1 dia (Efeito Montanha)
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
      
      labels = [yesterdayStr, labels[0], tomorrowStr]
      
      canais.forEach(canal => {
        paddingData.push({ label: canal, dt_referencia: yesterdayStr, qtd: 0 })
        paddingData.push({ label: canal, dt_referencia: tomorrowStr, qtd: 0 })
      })
    }

    const combinedData = [...paddingData, ...rawData]
    
    const series = canais.map(canal => {
      const dataForCanal = labels.map(dataRef => {
        const item = combinedData.find(d => d.label === canal && d.dt_referencia === dataRef)
        return item ? Number(item.qtd) : 0
      })
      return { name: canal, data: dataForCanal }
    })

    return {
      ...baseChartOptions.value,
      chart: { 
        ...baseChartOptions.value.chart,
        type: 'line', 
        height: 350, 
        stacked: true, 
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 4 },
      markers: { 
        size: 5,
        strokeWidth: 3,
        strokeColors: $q.dark.isActive ? '#1e293b' : '#fff',
        hover: { size: 7 }
      },
      xaxis: {
        ...baseChartOptions.value.xaxis,
        categories: labels
      },
      tooltip: { 
        ...baseChartOptions.value.tooltip,
        shared: true, 
        intersect: false,
        marker: { show: true },
        x: { show: true }
      },
      legend: { 
        ...baseChartOptions.value.legend,
        position: 'top', 
        horizontalAlign: 'left', 
        fontFamily: 'Nunito', 
        fontWeight: 600,
        labels: {
          colors: $q.dark.isActive ? '#94a3b8' : '#64748b'
        }
      },
      series: series
    }
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

const formatTimeCompact = (obj) => {
  if (!obj || (!obj.hours && !obj.minutes)) return '0m'
  const h = obj.hours ? `${obj.hours}h ` : ''
  const m = obj.minutes ? `${obj.minutes}m` : '0m'
  return `${h}${m}`.trim()
}

const cTmaFormat = computed(() => formatTimeCompact(ticketsAndTimes.value.tma))
const cTmeFormat = computed(() => formatTimeCompact(ticketsAndTimes.value.tme))

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
    progressValue: 0.9
  }
])

const filaStore = useFilaStore()

const getDashData = () => {
  obterDashTicketsAndTimes(params)
  obterDashTicketsChannels(params)
  obterDashTicketsEvolutionChannels(params)
  obterDashTicketsQueue(params)
  obterDashTicketsEvolutionByPeriod(params)
  obterDashTicketsPerUsersDetail(params)
}

const listarFilas = async () => {
  await filaStore.listarFilas()
}

onMounted(() => {
  listarFilas()
  getDashData()
})
</script>

<style lang="scss" scoped>
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
