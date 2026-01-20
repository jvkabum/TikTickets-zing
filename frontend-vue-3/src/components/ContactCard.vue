<template>
  <q-card
    class="contact-card"
    flat
    :bordered="bordered"
  >
    <q-card-section class="row items-center no-wrap q-pa-sm">
      <TicketAvatar
        :src="contact.profilePicUrl"
        :status="status"
        :unread-count="unreadCount"
        size="50px"
      />

      <div class="col q-ml-sm overflow-hidden">
        <div class="text-subtitle1 text-weight-bold ellipsis">
          {{ contact.name || 'Sem nome' }}
        </div>
        <div class="text-caption text-grey-7 ellipsis">
          {{ contact.number }}
        </div>
        <div
          v-if="lastMessage"
          class="text-caption text-grey-6 ellipsis"
        >
          {{ lastMessage }}
        </div>
      </div>

      <div
        v-if="showTime"
        class="column items-end q-ml-sm"
      >
        <div class="text-caption text-grey-6">
          {{ formattedTime }}
        </div>
        <StatusBadge
          v-if="ticketStatus"
          :status="ticketStatus"
          :show-icon="false"
          class="q-mt-xs"
        />
      </div>

      <slot name="actions" />
    </q-card-section>

    <!-- Tags -->
    <q-card-section
      v-if="contact.tags && contact.tags.length > 0"
      class="q-pa-xs q-pt-none"
    >
      <q-chip
        v-for="tag in contact.tags.slice(0, 3)"
        :key="tag.id"
        :style="{ backgroundColor: tag.color }"
        text-color="white"
        size="sm"
        dense
      >
        {{ tag.tag }}
      </q-chip>
      <q-chip
        v-if="contact.tags.length > 3"
        size="sm"
        dense
        color="grey-4"
      >
        +{{ contact.tags.length - 3 }}
      </q-chip>
    </q-card-section>
  </q-card>
</template>

<script setup>

const props = defineProps({
  contact: {
    type: Object,
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: String,
    default: ''
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: ''
  },
  ticketStatus: {
    type: String,
    default: ''
  },
  showTime: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  }
})

const formattedTime = computed(() => {
  if (!props.lastMessageTime) return ''
  try {
    const date = parseISO(props.lastMessageTime)
    if (!isValid(date)) return ''
    
    const now = new Date()
    const msgDate = new Date(date)
    
    // Se for hoje, mostra só a hora
    if (msgDate.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm')
    }
    
    // Se for ontem
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    }
    
    // Caso contrário, mostra a data
    return format(date, 'dd/MM/yy')
  } catch {
    return ''
  }
})
</script>

<style lang="scss" scoped>
.contact-card {
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
