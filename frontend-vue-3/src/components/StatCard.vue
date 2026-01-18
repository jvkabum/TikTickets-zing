<template>
  <q-card
    class="stat-card"
    :class="{ 'stat-card--clickable': clickable }"
    flat
    bordered
    @click="clickable && $emit('click')"
  >
    <q-card-section class="row items-center no-wrap">
      <q-avatar
        :color="color"
        text-color="white"
        :icon="icon"
        size="50px"
        class="q-mr-md"
      />
      <div class="col">
        <div class="text-h5 text-weight-bold">
          {{ formattedValue }}
        </div>
        <div class="text-caption text-grey-7">
          {{ label }}
        </div>
      </div>
      <div
        v-if="trend !== null"
        class="trend-indicator"
        :class="trendClass"
      >
        <q-icon :name="trendIcon" size="16px" />
        <span class="text-caption q-ml-xs">{{ Math.abs(trend) }}%</span>
      </div>
    </q-card-section>

    <q-linear-progress
      v-if="showProgress"
      :value="progressValue"
      :color="color"
      track-color="grey-3"
      class="q-mt-sm"
    />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    default: 0
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-chart-bar'
  },
  color: {
    type: String,
    default: 'primary'
  },
  trend: {
    type: Number,
    default: null
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progressValue: {
    type: Number,
    default: 0
  },
  clickable: {
    type: Boolean,
    default: false
  },
  formatType: {
    type: String,
    default: 'number', // 'number', 'currency', 'percent', 'time'
    validator: (v) => ['number', 'currency', 'percent', 'time'].includes(v)
  }
})

defineEmits(['click'])

const formattedValue = computed(() => {
  const val = Number(props.value)
  
  switch (props.formatType) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val)
    
    case 'percent':
      return `${val.toFixed(1)}%`
    
    case 'time':
      // Formata segundos para hh:mm:ss
      const hours = Math.floor(val / 3600)
      const minutes = Math.floor((val % 3600) / 60)
      const seconds = val % 60
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m ${seconds}s`
    
    default:
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString('pt-BR')
  }
})

const trendClass = computed(() => ({
  'text-positive': props.trend > 0,
  'text-negative': props.trend < 0,
  'text-grey': props.trend === 0
}))

const trendIcon = computed(() => {
  if (props.trend > 0) return 'mdi-trending-up'
  if (props.trend < 0) return 'mdi-trending-down'
  return 'mdi-minus'
})
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 12px;
  transition: all 0.2s;

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.trend-indicator {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
}
</style>
