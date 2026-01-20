<template>
  <div class="chat-header row items-center q-pa-sm bg-white">
    <!-- Avatar e Info do Contato -->
    <div
      class="row items-center cursor-pointer"
      @click="$emit('contact-click')"
    >
      <TicketAvatar
        :src="contact?.profilePicUrl"
        :status="contactStatus"
        size="45px"
      />
      <div class="q-ml-sm">
        <div class="text-subtitle1 text-weight-bold ellipsis" style="max-width: 200px">
          {{ contact?.name || 'Sem nome' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ contact?.number }}
        </div>
      </div>
    </div>

    <q-space />

    <!-- Ações -->
    <div class="row q-gutter-xs">
      <q-btn
        flat
        round
        icon="mdi-magnify"
        @click="$emit('search-click')"
      >
        <q-tooltip>Buscar mensagens</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        icon="mdi-information-outline"
        @click="$emit('info-click')"
      >
        <q-tooltip>Informações do contato</q-tooltip>
      </q-btn>

      <q-btn-dropdown
        flat
        round
        icon="mdi-dots-vertical"
        dropdown-icon="none"
      >
        <q-list style="min-width: 180px">
          <q-item
            clickable
            v-close-popup
            @click="$emit('transfer-click')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-account-arrow-right" />
            </q-item-section>
            <q-item-section>Transferir</q-item-section>
          </q-item>
          
          <q-item
            clickable
            v-close-popup
            @click="$emit('schedule-click')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-clock-outline" />
            </q-item-section>
            <q-item-section>Agendar</q-item-section>
          </q-item>

          <q-separator />

          <q-item
            clickable
            v-close-popup
            @click="$emit('close-ticket')"
          >
            <q-item-section avatar>
              <q-icon name="mdi-check-circle" color="positive" />
            </q-item-section>
            <q-item-section>Encerrar</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  contact: {
    type: Object,
    default: () => ({})
  },
  ticket: {
    type: Object,
    default: () => ({})
  }
})

defineEmits([
  'contact-click',
  'search-click',
  'info-click',
  'transfer-click',
  'schedule-click',
  'close-ticket'
])

const contactStatus = computed(() => {
  // Pode ser expandido para verificar status real do contato
  return ''
})
</script>

<style lang="scss" scoped>
.chat-header {
  border-bottom: 1px solid #e0e0e0;
  min-height: 60px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
