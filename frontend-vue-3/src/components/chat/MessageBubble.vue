<template>
  <div
    :class="bubbleClass"
    class="message-bubble"
  >
    <!-- Header com nome do contato (para grupos) -->
    <div
      v-if="showHeader && !fromMe"
      class="bubble-header text-caption text-weight-bold"
      :style="{ color: headerColor }"
    >
      {{ contactName }}
    </div>

    <!-- Mensagem respondida -->
    <div
      v-if="quotedMessage"
      class="quoted-message q-pa-xs q-mb-xs"
      @click="$emit('quote-click', quotedMessage)"
    >
      <div class="text-caption text-weight-bold text-primary">
        {{ quotedMessage.contact?.name || 'Você' }}
      </div>
      <div class="text-caption ellipsis-2-lines">
        {{ quotedMessage.body }}
      </div>
    </div>

    <!-- Conteúdo da mensagem -->
    <div class="bubble-content">
      <!-- Mídia -->
      <slot name="media" />

      <!-- Texto da mensagem -->
      <div
        v-if="body"
        class="message-text"
        v-html="formattedBody"
      />
    </div>

    <!-- Footer com hora e status -->
    <div class="bubble-footer row items-center justify-end q-gutter-xs">
      <span class="message-time text-caption">
        {{ formattedTime }}
      </span>
      <q-icon
        v-if="fromMe"
        :name="ackIcon"
        :color="ackColor"
        size="14px"
      />
    </div>
  </div>
</template>

<script setup>
import { format, isValid, parseISO } from 'date-fns'
import { useMessages } from 'src/composables/useMessages'

const props = defineProps({
  body: {
    type: String,
    default: ''
  },
  fromMe: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: String,
    default: ''
  },
  ack: {
    type: Number,
    default: 0
  },
  contactName: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: false
  },
  quotedMessage: {
    type: Object,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
})

defineEmits(['quote-click'])

const { formatarMensagemWhatsapp } = useMessages()

const bubbleClass = computed(() => ({
  'bubble-sent': props.fromMe,
  'bubble-received': !props.fromMe,
  'bubble-deleted': props.isDeleted
}))

const formattedBody = computed(() => {
  if (props.isDeleted) {
    return '<i class="text-grey">Mensagem apagada</i>'
  }
  return formatarMensagemWhatsapp(props.body)
})

const formattedTime = computed(() => {
  if (!props.timestamp) return ''
  try {
    const date = parseISO(props.timestamp)
    if (!isValid(date)) return ''
    return format(date, 'HH:mm')
  } catch {
    return ''
  }
})

const ackIcon = computed(() => {
  const icons = {
    0: 'mdi-clock-outline',
    1: 'mdi-check',
    2: 'mdi-check-all',
    3: 'mdi-check-all',
    4: 'mdi-check-all'
  }
  return icons[props.ack] || 'mdi-clock-outline'
})

const ackColor = computed(() => {
  if (props.ack >= 3) return 'light-blue'
  if (props.ack >= 1) return 'grey'
  return 'grey-5'
})

// Gera cor consistente baseada no nome do contato
const headerColor = computed(() => {
  if (!props.contactName) return '#1976D2'
  let hash = 0
  for (let i = 0; i < props.contactName.length; i++) {
    hash = props.contactName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800']
  return colors[Math.abs(hash) % colors.length]
})
</script>

<style lang="scss" scoped>
.message-bubble {
  max-width: 65%;
  min-width: 100px;
  padding: 6px 8px 4px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
}

.bubble-sent {
  background-color: #dcf8c6;
  margin-left: auto;
  border-bottom-right-radius: 0;
  body.body--dark & {
    background-color: #056162;
    color: #f1f5f9;
  }
}

.bubble-received {
  background-color: #fff;
  margin-right: auto;
  border-bottom-left-radius: 0;
  body.body--dark & {
    background-color: #1e293b;
    color: #f1f5f9;
  }
}

.bubble-deleted {
  opacity: 0.7;
}

.quoted-message {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #1976D2;
  border-radius: 4px;
  cursor: pointer;
  body.body--dark & {
    background: rgba(255, 255, 255, 0.1);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    body.body--dark & {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.bubble-footer {
  margin-top: 2px;
}

.message-time {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.45);
  body.body--dark & {
    color: rgba(255, 255, 255, 0.5);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
