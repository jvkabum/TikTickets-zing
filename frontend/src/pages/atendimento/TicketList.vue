<template>
  <div>
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100vh - 300px)"
      @scroll="onScroll"
    >
      <!-- <q-separator /> -->
      <div v-if="cTickets.length === 0" class="text-center q-pa-lg">
        <q-icon name="mdi-ticket" size="4em" color="grey-5" />
        <div class="text-h6 text-grey-5">Nenhum ticket encontrado</div>
        <div class="text-grey-6" v-if="cFiltroSelecionado">
          Tente remover alguns filtros para ver mais resultados
        </div>
      </div>
      <ItemTicket
        v-for="(ticket, key) in renderTickets"
        :key="key + '_' + refreshKey"
        :ticket="ticket"
        :filas="filas"
      />
      <div v-if="loading">
        <div class="row justify-center q-my-md">
          <q-spinner
            color="white"
            size="3em"
            :thickness="3"
          />
        </div>
        <div class="row col justify-center q-my-sm text-white">
          Carregando...
        </div>
      </div>
    </q-scroll-area>

  </div>
</template>

<script>
import ItemTicket from './ItemTicket.vue'
import { mapGetters, mapState } from 'vuex'
import { ConsultarTickets } from 'src/service/tickets'
import { socketIO } from '../../utils/socket'

export default {
  name: 'TocketList',
  components: {
    ItemTicket
  },
  props: {
    filas: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'open'
    },
    searchParam: {
      type: String,
      default: ''
    },
    showAll: {
      type: Boolean,
      default: false
    },
    withUnreadMessages: {
      type: Boolean,
      default: false
    },
    isNotAssignedUser: {
      type: Boolean,
      default: false
    },
    includeNotQueueDefined: {
      type: Boolean,
      default: true
    },
    queuesIds: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      socket: null,
      loading: false,
      countTickets: 0,
      hasMore: true,
      pesquisaTickets: {
        pageNumber: 1,
        count: null
        // date: new Date(),
      },
      socketCheckInterval: null,
      socketReconnectAttempts: 0,
      maxReconnectAttempts: 10,
      refreshKey: 0,
      renderTimer: null,
      lastTicketsHash: ''
    }
  },
  computed: {
    ...mapGetters([
      'getTickets',
      'ticketFocado',
      'whatsapps'
    ]),
    ...mapState({
      profilePicCache: state => state.user.profilePicCache
    }),
    cTickets () {
      try {
        const tickets = this.getTickets(this.status);
        
        // Verificar se é um array válido
        if (!Array.isArray(tickets)) {
          console.warn(`cTickets: getTickets(${this.status}) não retornou um array`, tickets);
          return [];
        }
        
        console.log(`cTickets: status=${this.status}, tickets=${tickets.length}`);
        return tickets;
      } catch (error) {
        console.error('Erro em cTickets computed property:', error);
        return [];
      }
    },
    renderTickets() {
      // Filtrar tickets para garantir que apenas tickets válidos sejam renderizados
      return this.cTickets.filter(ticket => ticket && ticket.id) || [];
    },
  mounted () {
    this.ticketListSocket();
    this.registerPropWatchers([
      'status',
      'showAll',
      'withUnreadMessages',
      'isNotAssignedUser',
      'includeNotQueueDefined',
      'queuesIds',
      'searchParam',
      'tags'
    ]);
    
    // Forçar carregamento inicial se a lista estiver vazia
    // Isso resolve o problema de precisar recarregar a página
    if (this.cTickets.length === 0) {
      this.consultarTickets({ pageNumber: 1 });
    }
  },
  beforeDestroy () {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.socketCheckInterval) {
      clearInterval(this.socketCheckInterval);
    }
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
