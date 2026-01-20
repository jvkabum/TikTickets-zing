<template>
  <div class="channel-status">
    <q-avatar
      :color="statusColor"
      text-color="white"
      size="32px"
    >
      <q-icon :name="channelIcon" size="18px" />
    </q-avatar>
    
    <div class="q-ml-sm">
      <div class="text-body2 text-weight-medium">
        {{ channel.name }}
      </div>
      <div class="row items-center">
        <q-badge
          :color="statusColor"
          :label="statusLabel"
          class="q-mr-xs"
        />
        <span
          v-if="channel.number"
          class="text-caption text-grey-7"
        >
          {{ channel.number }}
        </span>
      </div>
    </div>

    <q-space />

    <!-- Indicador de conexão animado -->
    <div
      v-if="isConnected"
      class="connection-indicator"
    >
      <span class="pulse"></span>
    </div>

    <!-- Ações -->
    <div class="actions q-gutter-xs">
      <q-btn
        v-if="!isConnected"
        icon="mdi-power"
        round
        flat
        size="sm"
        color="positive"
        @click="$emit('connect')"
      >
        <q-tooltip>Conectar</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        icon="mdi-power-off"
        round
        flat
        size="sm"
        color="negative"
        @click="$emit('disconnect')"
      >
        <q-tooltip>Desconectar</q-tooltip>
      </q-btn>
      <q-btn
        icon="mdi-qrcode"
        round
        flat
        size="sm"
        @click="$emit('show-qrcode')"
      >
        <q-tooltip>QR Code</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  channel: {
    type: Object,
    required: true
  }
})

defineEmits(['connect', 'disconnect', 'show-qrcode'])

const statusConfig = {
  CONNECTED: { color: 'positive', label: 'Conectado' },
  DISCONNECTED: { color: 'grey', label: 'Desconectado' },
  OPENING: { color: 'warning', label: 'Conectando...' },
  qrcode: { color: 'info', label: 'Aguardando QR' },
  TIMEOUT: { color: 'negative', label: 'Timeout' },
  CONFLICT: { color: 'negative', label: 'Conflito' }
}

const status = computed(() => props.channel.status || 'DISCONNECTED')

const statusColor = computed(() => 
  statusConfig[status.value]?.color || 'grey'
)

const statusLabel = computed(() => 
  statusConfig[status.value]?.label || status.value
)

const isConnected = computed(() => status.value === 'CONNECTED')

const channelIcon = computed(() => {
  const type = props.channel.type || 'whatsapp'
  const icons = {
    whatsapp: 'mdi-whatsapp',
    telegram: 'mdi-telegram',
    facebook: 'mdi-facebook-messenger',
    instagram: 'mdi-instagram'
  }
  return icons[type] || 'mdi-message'
})
</script>

<style lang="scss" scoped>
.channel-status {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.connection-indicator {
  position: relative;
  width: 12px;
  height: 12px;
  margin-right: 12px;

  .pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #4CAF50;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.actions {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.channel-status:hover .actions {
  opacity: 1;
}
</style>
