<template>
  <q-card
    class="campanha-card"
    flat
    bordered
  >
    <q-card-section class="row items-start no-wrap">
      <q-avatar
        :color="statusColor"
        text-color="white"
        icon="mdi-bullhorn"
        size="50px"
        class="q-mr-md"
      />
      
      <div class="col">
        <div class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">
            {{ campanha.name }}
          </div>
          <CampanhaStatus :status="campanha.status" />
        </div>
        
        <div class="text-caption text-grey-7 q-mt-xs">
          {{ campanha.message?.substring(0, 100) }}{{ campanha.message?.length > 100 ? '...' : '' }}
        </div>

        <div class="row items-center q-mt-sm q-gutter-md text-caption">
          <div>
            <q-icon name="mdi-account-group" class="q-mr-xs" />
            {{ campanha.contactsCount || 0 }} contatos
          </div>
          <div>
            <q-icon name="mdi-send" class="q-mr-xs" />
            {{ campanha.sentCount || 0 }} enviados
          </div>
          <div v-if="campanha.scheduledAt">
            <q-icon name="mdi-clock-outline" class="q-mr-xs" />
            {{ formatDate(campanha.scheduledAt) }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn
        flat
        label="Editar"
        color="primary"
        @click="$emit('edit', campanha)"
      />
      <q-btn
        v-if="campanha.status === 'pending'"
        flat
        label="Iniciar"
        color="positive"
        @click="$emit('start', campanha)"
      />
      <q-btn
        v-if="campanha.status === 'processing'"
        flat
        label="Cancelar"
        color="negative"
        @click="$emit('cancel', campanha)"
      />
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        round
        @click="$emit('delete', campanha)"
      />
    </q-card-actions>

    <!-- Progress bar para campanhas em andamento -->
    <q-linear-progress
      v-if="campanha.status === 'processing'"
      :value="progress"
      color="primary"
      class="absolute-bottom"
    />
  </q-card>
</template>

<script setup>

const props = defineProps({
  campanha: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'start', 'cancel', 'delete'])

const statusColors = {
  pending: 'grey',
  scheduled: 'blue',
  processing: 'orange',
  finished: 'green',
  cancelled: 'red'
}

const statusColor = computed(() => 
  statusColors[props.campanha.status] || 'grey'
)

const progress = computed(() => {
  const total = props.campanha.contactsCount || 1
  const sent = props.campanha.sentCount || 0
  return sent / total
})

const formatDate = (date) => {
  if (!date) return ''
  try {
    return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch {
    return ''
  }
}
</script>

<style lang="scss" scoped>
.campanha-card {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
</style>
