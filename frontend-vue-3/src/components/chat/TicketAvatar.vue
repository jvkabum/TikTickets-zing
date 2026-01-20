<template>
  <q-avatar
    :size="size"
    :class="avatarClass"
  >
    <q-img
      v-if="src"
      :src="src"
      spinner-color="primary"
      @error="handleImageError"
    />
    <q-icon
      v-else
      :name="fallbackIcon"
      :size="iconSize"
      color="grey-5"
    />
    <q-badge
      v-if="showStatus"
      floating
      rounded
      :color="statusColor"
      class="status-badge"
    />
    <q-badge
      v-if="unreadCount > 0"
      floating
      color="red"
      text-color="white"
      class="unread-badge"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </q-badge>
  </q-avatar>
</template>

<script setup>

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: '40px'
  },
  status: {
    type: String,
    default: '', // 'online', 'offline', 'away'
    validator: (v) => ['', 'online', 'offline', 'away'].includes(v)
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: false
  }
})

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

const showStatus = computed(() => props.status !== '')

const statusColor = computed(() => {
  const colors = {
    online: 'positive',
    offline: 'grey',
    away: 'warning'
  }
  return colors[props.status] || 'grey'
})

const fallbackIcon = computed(() => {
  return props.isGroup ? 'mdi-account-group' : 'mdi-account'
})

const iconSize = computed(() => {
  // Calcula tamanho do ícone baseado no tamanho do avatar
  const sizeNum = parseInt(props.size)
  return `${Math.floor(sizeNum * 0.6)}px`
})

const avatarClass = computed(() => ({
  'avatar-bordered': props.bordered,
  'bg-grey-3': true
}))
</script>

<style lang="scss" scoped>
.avatar-bordered {
  border: 2px solid #e0e0e0;
}

.status-badge {
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  min-width: 12px;
  border: 2px solid white;
}

.unread-badge {
  top: -4px;
  right: -4px;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
}
</style>
