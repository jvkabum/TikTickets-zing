<template>
  <q-card
    class="stat-card glass-premium hover-premium overflow-hidden"
    :class="{ 'stat-card--clickable': clickable }"
    flat
    @click="clickable && $emit('click')"
  >
    <q-card-section class="q-pa-lg">
      <div class="row items-center no-wrap q-mb-md">
        <div 
          class="flex flex-center q-mr-md rounded-all shadow-1"
          :class="`grad-${color}`"
          style="width: 48px; height: 48px; border-radius: 12px;"
        >
          <q-icon
            :name="icon"
            color="white"
            size="24px"
          />
        </div>
        
        <div class="col">
          <div 
            class="text-caption text-uppercase text-weight-bolder letter-spacing-1"
            :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'"
          >
            {{ label }}
          </div>
          <div 
            class="text-h4 text-weight-bolder line-height-1 text-dark-theme"
          >
            {{ formattedValue }}
          </div>
        </div>

        <div
          v-if="trend !== null"
          class="trend-bubble flex flex-center"
          :class="trendClass"
        >
          <q-icon :name="trendIcon" size="14px" />
          <span class="text-caption text-weight-bold q-ml-xs">{{ Math.abs(trend) }}%</span>
        </div>
      </div>

      <div class="q-mt-md">
        <q-linear-progress
          v-if="showProgress"
          :value="progressValue"
          :color="color"
          track-color="grey-3"
          class="rounded-all"
          style="height: 6px"
        />
        
        <div v-if="description" class="text-caption q-mt-sm row items-center" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
          <q-icon name="mdi-clock-outline" size="14px" class="q-mr-xs" v-if="formatType === 'time'" />
          <q-icon name="mdi-trending-up" size="14px" class="q-mr-xs" v-else-if="trend > 0" color="positive" />
          <q-icon name="mdi-trending-down" size="14px" class="q-mr-xs" v-else-if="trend < 0" color="negative" />
          {{ description }}
        </div>
      </div>
    </q-card-section>
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
  description: {
    type: String,
    default: ''
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
    default: true
  },
  progressValue: {
    type: Number,
    default: 0.7
  },
  clickable: {
    type: Boolean,
    default: false
  },
  formatType: {
    type: String,
    default: 'number',
    validator: (v) => ['number', 'currency', 'percent', 'time', 'text'].includes(v)
  }
})

defineEmits(['click'])

const formattedValue = computed(() => {
  if (props.formatType === 'text') {
    return props.value
  }

  const val = Number(props.value)
  if (isNaN(val)) return props.value
  
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
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  
  &--clickable {
    cursor: pointer;
  }
}

.trend-bubble {
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
  
  &.text-positive {
    background: rgba(var(--q-positive), 0.1);
    color: var(--q-positive) !important;
  }
  
  &.text-negative {
    background: rgba(var(--q-negative), 0.1);
    color: var(--q-negative) !important;
  }
}

.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
