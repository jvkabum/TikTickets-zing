<template>
  <div class="report-table-container">
    <q-table
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :filter="filter"
      row-key="id"
      flat
      bordered
      binary-state-sort
      class="report-table"
    >
      <!-- Top Slot Customizado -->
      <template v-slot:top-right>
        <q-input
          v-if="showSearch"
          v-model="filter"
          borderless
          dense
          debounce="300"
          placeholder="Buscar..."
          class="q-mr-sm"
        >
          <template v-slot:append>
            <q-icon name="mdi-magnify" />
          </template>
        </q-input>
        
        <q-btn-dropdown
          v-if="showColumns"
          flat
          round
          dense
          icon="mdi-view-column"
        >
          <q-list>
            <q-item v-for="col in columns" :key="col.name">
              <q-checkbox v-model="col.required" :label="col.label" />
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <!-- Slot para Header -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="text-weight-bold"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Slot para Body Personalizado -->
      <template v-slot:body="props">
        <q-tr :props="props" :class="{ 'tr-hover': true }">
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <!-- Slot dinâmico por coluna -->
            <slot :name="`col-${col.name}`" :row="props.row" :val="col.value">
              {{ col.value }}
            </slot>
          </q-td>
        </q-tr>
      </template>

      <!-- Loading Slot -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      
      <!-- No Data Slot -->
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey-7">
          <q-icon name="mdi-alert-circle-outline" size="24px" class="q-mr-sm" />
          <span>Nenhum registro encontrado</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showColumns: {
    type: Boolean,
    default: false
  }
})

const filter = ref('')
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
})
</script>

<style lang="scss" scoped>
.report-table {
  border-radius: 8px;

  .q-table__top {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .q-th {
    font-size: 0.85rem;
    color: #555;
  }

  .tr-hover:hover {
    background: #fafafa !important;
  }
}
</style>
