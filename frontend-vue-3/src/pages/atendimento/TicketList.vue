<template>
  <div>
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100vh - 300px)"
      @scroll="onScroll"
    >
      <div
        v-if="filteredTickets.length === 0"
        class="text-center q-pa-lg"
      >
        <q-icon
          name="mdi-ticket"
          size="4em"
          color="grey-5"
        />
        <div class="text-h6 text-grey-5">Nenhum ticket encontrado</div>
        <div
          class="text-grey-6"
          v-if="cFiltroSelecionado"
        >
          Tente remover alguns filtros para ver mais resultados
        </div>
      </div>
      <ItemTicket
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        :ticket="ticket"
        :filas="filas"
      />
      <div v-if="loading">
        <div class="row justify-center q-my-md">
          <q-spinner
            color="primary"
            size="3em"
            :thickness="3"
          />
        </div>
        <div class="row col justify-center q-my-sm text-grey-7">Carregando...</div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import ItemTicket from './ItemTicket.vue'

const props = defineProps({
  filas: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: 'open'
  },
  searchParams: {
    type: Object,
    required: true
  }
})

const ticketStore = useTicketStore()
const { tickets, hasMore, loading } = storeToRefs(ticketStore)

const scrollAreaTickets = ref(null)

const filteredTickets = computed(() => {
  if (props.status === 'groups') {
    return tickets.value.filter(t => t.isGroup)
  }
  return tickets.value.filter(t => t.status === props.status && !t.isGroup)
})

const cFiltroSelecionado = computed(() => {
  const p = props.searchParams
  return !!(
    p.searchParam ||
    p.queuesIds?.length ||
    p.tagsIds?.length ||
    p.showAll ||
    p.withUnreadMessages ||
    p.isNotAssignedUser
  )
})

const consultarTickets = async (isLoadMore = false) => {
  if (loading.value) return

  if (!isLoadMore) {
    props.searchParams.pageNumber = 1
  }

  const params = {
    ...props.searchParams,
    status: props.status === 'groups' ? ['open', 'pending'] : [props.status],
    isGroup: props.status === 'groups'
  }

  await ticketStore.consultarTickets(params, isLoadMore)
}

const onScroll = info => {
  if (info.verticalPercentage <= 0.85) return
  if (hasMore.value && !loading.value) {
    props.searchParams.pageNumber++
    consultarTickets(true)
  }
}

// Observar mudanças nos filtros para recarregar a lista
watch(
  () => props.searchParams,
  () => {
    consultarTickets()
  },
  { deep: true }
)

watch(
  () => props.status,
  () => {
    consultarTickets()
  }
)

onMounted(() => {
  consultarTickets()
})

onUnmounted(() => {
  // Limpeza se necessário
})
</script>

<style lang="scss" scoped>
.q-scroll-area {
  z-index: 1;
}
</style>
