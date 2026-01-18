<template>
  <q-card
    class="filter-panel"
    flat
    bordered
  >
    <q-card-section class="q-pa-sm">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-weight-bold">
          Filtros Avançados
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          size="sm"
          @click="$emit('close')"
        />
      </div>

      <q-separator class="q-mb-sm" />

      <!-- Checkboxes de filtros rápidos -->
      <div class="q-gutter-xs q-mb-sm">
        <q-checkbox
          v-model="localFiltros.showAll"
          label="Visualizar todos os atendimentos"
          dense
          @update:model-value="emitChange"
        />
        <q-checkbox
          v-model="localFiltros.withUnreadMessages"
          label="Somente com mensagens não lidas"
          dense
          @update:model-value="emitChange"
        />
        <q-checkbox
          v-model="localFiltros.isNotAssignedUser"
          label="Somente sem usuário atribuído"
          dense
          @update:model-value="emitChange"
        />
      </div>

      <!-- Seletor de Filas -->
      <q-select
        v-if="filas.length > 0"
        v-model="localFiltros.queuesIds"
        :options="filas"
        label="Filtrar por Filas"
        multiple
        use-chips
        option-value="id"
        option-label="queue"
        emit-value
        map-options
        outlined
        dense
        class="q-mb-sm"
        @update:model-value="emitChange"
      />

      <!-- Seletor de Etiquetas -->
      <q-select
        v-if="etiquetas.length > 0"
        v-model="localFiltros.tagsIds"
        :options="etiquetas"
        label="Filtrar por Etiquetas"
        multiple
        use-chips
        option-value="id"
        option-label="tag"
        emit-value
        map-options
        outlined
        dense
        class="q-mb-sm"
        @update:model-value="emitChange"
      />

      <!-- Botão Limpar -->
      <div class="row justify-center">
        <q-btn
          label="Limpar Filtros"
          color="primary"
          flat
          dense
          @click="limparFiltros"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  filtros: {
    type: Object,
    required: true
  },
  filas: {
    type: Array,
    default: () => []
  },
  etiquetas: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filtros', 'change', 'close', 'clear'])

const localFiltros = reactive({
  showAll: false,
  withUnreadMessages: false,
  isNotAssignedUser: false,
  queuesIds: [],
  tagsIds: []
})

// Sincroniza props com estado local
watch(
  () => props.filtros,
  (newVal) => {
    localFiltros.showAll = newVal.showAll || false
    localFiltros.withUnreadMessages = newVal.withUnreadMessages || false
    localFiltros.isNotAssignedUser = newVal.isNotAssignedUser || false
    localFiltros.queuesIds = newVal.queuesIds || []
    localFiltros.tagsIds = newVal.tagsIds || []
  },
  { immediate: true, deep: true }
)

const emitChange = () => {
  emit('update:filtros', { ...localFiltros })
  emit('change', { ...localFiltros })
}

const limparFiltros = () => {
  localFiltros.showAll = false
  localFiltros.withUnreadMessages = false
  localFiltros.isNotAssignedUser = false
  localFiltros.queuesIds = []
  localFiltros.tagsIds = []
  emit('clear')
  emitChange()
}
</script>

<style lang="scss" scoped>
.filter-panel {
  min-width: 300px;
  max-width: 350px;
}
</style>
