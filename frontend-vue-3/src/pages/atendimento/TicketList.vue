<template>
  <div>
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100vh - 235px)"
      @scroll="onScroll"
    >
      <div
        v-if="renderTickets.length === 0"
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
        v-for="ticket in renderTickets"
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

<script>
import { mapStores } from 'pinia'
import { useTicketStore } from 'src/stores/useTicketStore'
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { socketIO } from '../../utils/socket'
import ItemTicket from './ItemTicket.vue'

export default {
  name: 'TicketList',
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
    activeTab: {
      type: String,
      default: 'open'
    },
    searchParams: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      socket: null,
      countTickets: 0,
      pesquisaTickets: {
        pageNumber: 1,
        count: null
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
    ...mapStores(useTicketStore, useUsuarioStore),
    
    // Computed para facilitar acesso ao ticket focado
    ticketFocado () {
      return this.ticketStore.ticketFocado
    },
    
    // Computed para facilitar acesso aos tickets filtrados do store
    cTickets () {
      // 1. Pegar a lista do bucket correspondente da store
      let tickets = []
      if (this.status === 'groups') {
        tickets = this.ticketStore.tickets.groups || []
      } else {
        tickets = this.ticketStore.tickets[this.status] || []
      }

      // 2. Aplicar filtro de busca client-side
      const search = (this.searchParams?.searchParam || '').toLowerCase().trim()
      
      if (search) {
        return tickets.filter(t => {
          const contactName = (t.contact?.name || '').toLowerCase()
          const contactNumber = (t.contact?.number || '').toLowerCase()
          const lastMessage = (t.lastMessage || '').toLowerCase()
          const ticketId = t.id.toString()
          
          return contactName.includes(search) || 
                 contactNumber.includes(search) || 
                 lastMessage.includes(search) ||
                 ticketId.includes(search)
        })
      }

      return tickets
    },
    
    renderTickets() {
      // Filtrar tickets para garantir que apenas tickets válidos sejam renderizados
      return this.cTickets.filter(ticket => ticket && ticket.id) || [];
    },
    
    // Nova propriedade computada para monitorar mudanças nos tickets
    ticketsHash() {
      return this.cTickets.map(t => t.id + '-' + t.updatedAt + '-' + t.unreadMessages).join('|');
    },
    
    // Profile Pic Cache do usuário store
    profilePicCache() {
      return this.usuarioStore.profilePicCache // Assumindo que existe no usuarioStore
    },
    
    loading() {
      return this.ticketStore.loading
    },
    
    hasMore() {
      return this.ticketStore.hasMore
    },

    cFiltroSelecionado () {
      const p = this.searchParams
      return !!(
        p.searchParam ||
        p.queuesIds?.length ||
        p.tagsIds?.length ||
        p.showAll ||
        p.withUnreadMessages ||
        p.isNotAssignedUser
      )
    }
  },
  watch: {
    'ticketFocado.id': {
      handler () {
        if (this.socket && this.ticketFocado?.id) {
          console.log('ticketFocado.id', this.ticketFocado.id)
          this.socket.emit(`tenant:${this.ticketFocado.tenantId}:joinChatBox`, `${this.ticketFocado.id}`)
        }
      },
      immediate: true
    },
    socket: {
      handler () {
        if (this.socket && this.ticketFocado?.id) {
          console.log('socket ticketFocado.id', this.ticketFocado.id)
          this.socket.emit(`tenant:${this.ticketFocado.tenantId}:joinChatBox`, `${this.ticketFocado.id}`)
        }
      },
      immediate: true
    },
    // Monitor para mudanças nos tickets
    ticketsHash: {
      handler(newHash, oldHash) {
        if (newHash && newHash !== oldHash && oldHash) {
          // console.log('Detectada mudança nos tickets, forçando atualização da UI');
          this.forceTicketListUpdate();
        }
        this.lastTicketsHash = newHash;
      }
    },
    'activeTab': {
      handler (activeTab) {
        if (activeTab === this.status) {
          this.consultarTickets()
        }
      },
      immediate: true
    },
    'searchParams': {
      handler () {
        if (this.activeTab === this.status) {
          this.consultarTickets()
        }
      },
      deep: true
    }
  },
  methods: {
    onScroll (info) {
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    async onLoadMore () {
      if (this.cTickets.length === 0 || !this.hasMore || this.loading) {
        return
      }
      try {
        this.searchParams.pageNumber++
        await this.consultarTickets(false) // false = load more
      } catch (error) {
        console.error(error)
      }
    },
    async consultarTickets (reset = true) {
      if (this.loading) return

      const params = {
        ...this.searchParams,
        status: this.status === 'groups' ? ['open', 'pending'] : [this.status],
        isGroup: this.status === 'groups'
      }

      if (reset) {
        this.searchParams.pageNumber = 1
        params.pageNumber = 1
      }

      try {
        await this.ticketStore.consultarTickets(params, !reset) // !reset = isLoadMore
        this.forceTicketListUpdate();
      } catch (err) {
        console.error('Erro consultarTickets', err)
      }
    },
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 200)
    },
    ticketListSocket () {
      if (this.socket && this.socket.connected) {
        console.log('Socket já conectado, desconectando antes de reconectar');
        this.socket.disconnect();
      }
      
      this.socket = socketIO();
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      this.socketReconnectAttempts = 0;

      const shouldUpdateTicket = (ticket) => {
        const isAssignedToUser = !ticket.userId || ticket.userId === usuario?.userId || this.searchParams.showAll;
        const isQueueIncluded = !ticket.queueId || this.searchParams.queuesIds.indexOf(ticket.queueId) > -1;
        return isAssignedToUser && isQueueIncluded;
      }

      const notBelongsToUserQueues = (ticket) =>
        ticket.queueId && this.searchParams.queuesIds.indexOf(ticket.queueId) === -1;

      this.socket.on('connect', () => {
        console.log('Socket conectado com sucesso!');
        if (this.status) {
          this.socket.emit(`tenant:${usuario.tenantId}:joinTickets`, this.status);
        } else {
          this.socket.emit(`tenant:${usuario.tenantId}:joinNotification`);
        }
        
        // Após conectar, atualizar a lista de tickets
        this.consultarTickets(true);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Erro de conexão do socket:', error);
        this.tentarReconectar();
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log(`Socket desconectado - razão: ${reason}`);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.tentarReconectar();
        }
      });

      this.socket.on(`tenant:${usuario.tenantId}:ticket`, (data) => {
        // console.log('SOCKET EVENT ticket:', data); 
        if (data.action === 'updateUnread') {
          console.log('UPDATE_UNREAD (implementar na store se necessario)', data);
          this.forceTicketListUpdate();
        }

        if (data.action === 'update' && shouldUpdateTicket(data.ticket)) {
          // console.log('UPDATE_TICKET chamado', data);
          if (data.ticket) {
            if (!data.ticket.lastMessageAt || isNaN(Number(data.ticket.lastMessageAt))) {
              data.ticket.lastMessageAt = Date.now().toString();
            }
          }
          // Chamada Pinia
          this.ticketStore.updateTicket(data.ticket);
          this.forceTicketListUpdate();
        }

        if (data.action === 'update' && notBelongsToUserQueues(data.ticket)) {
          // Chamada Pinia
          this.ticketStore.deleteTicket(data.ticket.id);
          this.forceTicketListUpdate();
        }

        if (data.action === 'delete') {
          this.ticketStore.deleteTicket(data.ticketId);
          this.forceTicketListUpdate();
        }
      });

      this.socket.on(`tenant:${usuario.tenantId}:appMessage`, (data) => {
        if (data.action === 'create' && shouldUpdateTicket(data.ticket)) {
          if (data.message && !data.message.timestamp) {
            data.message.timestamp = Date.now().toString();
          }
          if (data.ticket && !data.ticket.lastMessageAt) {
            data.ticket.lastMessageAt = Date.now().toString();
          }
          
          if (this.ticketFocado.id !== data.ticket.id && this.status !== 'closed' && !data.message.fromMe && !data.ticket.chatFlowId) {
            this.$root.$emit('handlerNotifications', data.message);
          }
          
          // UPDATE_TICKET_UNREAD_MESSAGES -> Pinia Logic
          // We don't have this specific mutation. We update the ticket.
          this.ticketStore.updateTicket(data.ticket);
          this.forceTicketListUpdate();
        }
      });
      
      if (this.socketCheckInterval) {
        clearInterval(this.socketCheckInterval);
      }
      
      this.socketCheckInterval = setInterval(() => {
        this.verificarConexaoSocket();
      }, 30000);
    },
    forceTicketListUpdate() {
      // Força a re-renderização do componente ItemTicket
      // Isso pode ser útil para garantir que as atualizações do socket sejam refletidas
      // sem precisar de uma recarga completa da lista.
      // Uma abordagem mais otimizada seria usar um key no v-for que mude
      // quando o ticket é atualizado, mas isso já é feito com ticket.id
      // Se o problema for a reatividade do array, podemos forçar uma cópia.
      // this.renderTickets = [...this.cTickets]; // Isso já é feito pelo computed
      // Ou, se for para forçar o componente pai a re-renderizar o v-for:
      this.refreshKey++;
    },
    verificarConexaoSocket() {
      if (this.socket && !this.socket.connected) {
        console.log('Socket desconectado. Tentando reconectar...');
        this.tentarReconectar();
      }
    },
    tentarReconectar() {
      if (this.socketReconnectAttempts < this.maxReconnectAttempts) {
        this.socketReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.socketReconnectAttempts), 30000); // Exponential back-off up to 30s
        console.log(`Tentando reconectar em ${delay / 1000} segundos... Tentativa ${this.socketReconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => {
          this.socket.connect();
        }, delay);
      } else {
        console.error('Número máximo de tentativas de reconexão do socket atingido.');
        // Opcional: Notificar o usuário ou tomar outra ação
      }
    }
  },
  mounted () {
    this.ticketListSocket()
  },
  unmounted () {
    if (this.socket) {
      this.socket.disconnect()
    }
    if (this.socketCheckInterval) {
      clearInterval(this.socketCheckInterval)
    }
  }
}
</script>

<style lang="scss" scoped>
.q-scroll-area {
  z-index: 1;
}
</style>
