<template>
  <q-btn
    :icon="hasActiveFilters ? 'mdi-filter-plus' : 'mdi-filter-outline'"
    class="btn-rounded"
    :color="hasActiveFilters ? 'deep-orange-9' : 'primary'"
  >
    <q-menu
      content-class="shadow-10 no-scroll"
      square
    >
      <div
        class="row q-pa-sm"
        style="min-width: 350px; max-width: 350px"
      >
        <div class="q-ma-sm full-width">
          <div class="row items-center justify-between q-mb-md relative-position">
            <div class="text-h6">Filtros Avançados</div>
            <q-btn
              color="negative"
              icon="close"
              flat
              round
              v-close-popup
              class="absolute-top-right q-mr-xs"
              size="md"
              style="margin-top: -2px"
            >
              <q-tooltip>Fechar</q-tooltip>
            </q-btn>
          </div>
          <q-separator />
          <div class="row q-mt-md">
            <q-checkbox
              :model-value="modelValue.showAll"
              label="Visualizar todos os atendimentos (Tickets)"
              @update:model-value="updateFilter('showAll', $event)"
            />
            <q-checkbox
              :model-value="modelValue.withUnreadMessages"
              label="Somente com mensagens não lidas"
              @update:model-value="updateFilter('withUnreadMessages', $event)"
            />
            <q-checkbox
              :model-value="modelValue.isNotAssignedUser"
              label="Somente sem usuário atribuído"
              @update:model-value="updateFilter('isNotAssignedUser', $event)"
            />
          </div>
          <q-select
            :model-value="modelValue.queuesIds"
            multiple
            :options="filas"
            use-chips
            option-value="id"
            option-label="queue"
            emit-value
            map-options
            label="Filas"
            outlined
            dense
            @update:model-value="updateFilter('queuesIds', $event)"
          />
          <q-select
            :model-value="modelValue.tagsIds"
            multiple
            :options="etiquetas"
            use-chips
            option-value="id"
            option-label="tag"
            emit-value
            map-options
            label="Etiquetas"
            outlined
            dense
            class="q-mt-sm"
            @update:model-value="updateFilter('tagsIds', $event)"
          />
          <div class="row items-center justify-center q-mt-sm">
            <q-btn
              label="Limpar Filtros"
              color="primary"
              flat
              @click="emit('clear')"
            />
          </div>
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup>
const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['update:modelValue', 'clear'])

const hasActiveFilters = computed(() => {
  return props.modelValue.showAll ||
    props.modelValue.withUnreadMessages ||
    props.modelValue.isNotAssignedUser ||
    (props.modelValue.queuesIds?.length > 0) ||
    (props.modelValue.tagsIds?.length > 0)
})

const updateFilter = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
