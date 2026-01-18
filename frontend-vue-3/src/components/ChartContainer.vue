<template>
  <div class="chart-container" :class="{ 'chart-container--loading': loading }">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey-7">{{ subtitle }}</div>
      </div>
      
      <div v-if="$slots.actions" class="row items-center q-gutter-x-sm">
        <slot name="actions" />
      </div>
    </div>

    <!-- Container do gráfico -->
    <div class="chart-wrapper relative-position" :style="{ height: height }">
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
      
      <slot v-if="!loading && !empty" />
      
      <!-- Estado vazio -->
      <div
        v-if="!loading && empty"
        class="absolute-full column flex-center text-grey-5"
      >
        <q-icon name="mdi-chart-bar-off" size="48px" />
        <div class="text-body2 q-mt-sm">Sem dados para exibir</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '300px'
  }
})
</script>

<style lang="scss" scoped>
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &--loading {
    opacity: 0.8;
    pointer-events: none;
  }
}

.chart-wrapper {
  width: 100%;
  min-height: 200px;
}
</style>
