<template>
  <div class="report-header q-mb-md">
    <div class="row items-center justify-between">
      <div>
        <h1 class="text-h5 text-weight-bold q-mb-xs">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-body2 text-grey-7 q-mb-none"
        >
          {{ subtitle }}
        </p>
      </div>

      <div class="row q-gutter-sm no-print">
        <!-- Filtro de Período -->
        <q-btn-dropdown
          v-if="showPeriodFilter"
          :label="periodLabel"
          icon="mdi-calendar"
          outline
          color="primary"
        >
          <q-list>
            <q-item
              v-for="option in periodOptions"
              :key="option.value"
              clickable
              v-close-popup
              @click="$emit('period-change', option.value)"
            >
              <q-item-section>{{ option.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Botão Exportar -->
        <q-btn-dropdown
          v-if="showExport"
          label="Exportar"
          icon="mdi-download"
          color="primary"
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="$emit('export', 'csv')"
            >
              <q-item-section avatar>
                <q-icon name="mdi-file-delimited" />
              </q-item-section>
              <q-item-section>CSV</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="$emit('export', 'pdf')"
            >
              <q-item-section avatar>
                <q-icon name="mdi-file-pdf-box" />
              </q-item-section>
              <q-item-section>PDF</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Botão Imprimir -->
        <q-btn
          v-if="showPrint"
          icon="mdi-printer"
          label="Imprimir"
          outline
          color="primary"
          @click="$emit('print')"
        />

        <!-- Botão Atualizar -->
        <q-btn
          v-if="showRefresh"
          icon="mdi-refresh"
          round
          flat
          color="primary"
          :loading="loading"
          @click="$emit('refresh')"
        >
          <q-tooltip>Atualizar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Info do período -->
    <div
      v-if="dateRange"
      class="text-caption text-grey-6 q-mt-sm"
    >
      Período: {{ dateRange }}
    </div>

    <q-separator class="q-mt-md" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  dateRange: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  showPeriodFilter: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: true
  },
  showPrint: {
    type: Boolean,
    default: true
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  selectedPeriod: {
    type: String,
    default: '30'
  }
})

defineEmits(['period-change', 'export', 'print', 'refresh'])

const periodOptions = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '15', label: 'Últimos 15 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '60', label: 'Últimos 60 dias' },
  { value: '90', label: 'Últimos 90 dias' }
]

const periodLabel = computed(() => {
  const option = periodOptions.find(o => o.value === props.selectedPeriod)
  return option?.label || 'Período'
})
</script>

<style lang="scss" scoped>
.report-header {
  @media print {
    .no-print {
      display: none !important;
    }
  }
}
</style>
