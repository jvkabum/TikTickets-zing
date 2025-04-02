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
    // Nova propriedade computada para monitorar mudanças nos tickets
    ticketsHash() {
      return this.cTickets.map(t => t.id + '-' + t.updatedAt + '-' + t.unreadMessages).join('|');
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
          console.log('Detectada mudança nos tickets, forçando atualização da UI');
          this.forceTicketListUpdate();
        }
        this.lastTicketsHash = newHash;
      }
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
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        status: this.status,
        searchParam: this.searchParam,
        showAll: this.showAll,
        withUnreadMessages: this.withUnreadMessages,
        isNotAssignedUser: this.isNotAssignedUser,
        includeNotQueueDefined: this.includeNotQueueDefined,
        queuesIds: this.queuesIds,
        ...paramsInit
      }

      if (params.pageNumber == 1) {
        this.$store.commit('RESET_TICKETS', this.status)
      }

      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // count total de tickets no status
        this.$store.commit('LOAD_TICKETS', { type: this.status, tickets: data.tickets })
        this.hasMore = data.hasMore
        this.forceTicketListUpdate(); // Força atualização após carregar novos tickets
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    // async BuscarTicketFiltro () {
    //   this.$store.commit('RESET_TICKETS', this.status)
    //   this.loading = true
    //   localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    //   this.pesquisaTickets = {
    //     ...this.pesquisaTickets,
    //     pageNumber: 1
    //   }
    //   await this.consultarTickets(this.pesquisaTickets)
    //   this.loading = false
    //   this.$setConfigsUsuario({ isDark: this.$q.dark.isActive })
    // },
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

      const shouldUpdateTicket = (ticket) =>
        (!ticket.userId || ticket.userId === usuario?.userId || this.showAll) &&
        (!ticket.queueId || this.queuesIds.indexOf(ticket.queueId) > -1);

      const notBelongsToUserQueues = (ticket) =>
        ticket.queueId && this.queuesIds.indexOf(ticket.queueId) === -1;

      this.socket.on('connect', () => {
        console.log('Socket conectado com sucesso!');
        if (this.status) {
          this.socket.emit(`tenant:${usuario.tenantId}:joinTickets`, this.status);
        } else {
          this.socket.emit(`tenant:${usuario.tenantId}:joinNotification`);
        }
        
        // Após conectar, atualizar a lista de tickets
        this.consultarTickets({ pageNumber: 1 });
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
        console.log('SOCKET EVENT ticket:', data); // Log completo
        if (data.action === 'updateUnread') {
          console.log('UPDATE_UNREAD chamado', data);
          this.$store.commit('RESET_UNREAD', { type: this.status, ticketId: data.ticketId });
          this.forceTicketListUpdate();
        }

        if (data.action === 'update' && shouldUpdateTicket(data.ticket)) {
          console.log('UPDATE_TICKET chamado', data);
          // Garantir que o ticket tenha um timestamp válido
          if (data.ticket) {
            if (!data.ticket.lastMessageAt || isNaN(Number(data.ticket.lastMessageAt))) {
              console.log('Corrigindo timestamp para ticket:', data.ticket.id);
              data.ticket.lastMessageAt = Date.now().toString();
            }
          }
          this.$store.commit('UPDATE_TICKET', { type: this.status, ticket: data.ticket });
          this.forceTicketListUpdate();
        }

        if (data.action === 'update' && notBelongsToUserQueues(data.ticket)) {
          console.log('DELETE_TICKET chamado', data);
          this.$store.commit('DELETE_TICKET', { type: this.status, ticketId: data.ticket.id });
          this.forceTicketListUpdate();
        }

        if (data.action === 'delete') {
          console.log('DELETE_TICKET chamado', data);
          this.$store.commit('DELETE_TICKET', { type: this.status, ticketId: data.ticketId });
          this.forceTicketListUpdate();
        }
      });

      this.socket.on(`tenant:${usuario.tenantId}:appMessage`, (data) => {
        console.log('SOCKET EVENT appMessage:', data); // Log completo
        if (data.action === 'create' && shouldUpdateTicket(data.ticket)) {
          console.log('UPDATE_TICKET_UNREAD_MESSAGES chamado', data);
          
          // Garantir que a mensagem e o ticket tenham timestamps válidos
          if (data.message && !data.message.timestamp) {
            console.log('Corrigindo timestamp para mensagem:', data.message.id);
            data.message.timestamp = Date.now().toString();
          }
          
          if (data.ticket && !data.ticket.lastMessageAt) {
            console.log('Corrigindo lastMessageAt para ticket:', data.ticket.id);
            data.ticket.lastMessageAt = Date.now().toString();
          }
          
          if (this.ticketFocado.id !== data.ticket.id && this.status !== 'closed' && !data.message.fromMe && !data.ticket.chatFlowId) {
            this.$root.$emit('handlerNotifications', data.message);
          }
          this.$store.commit('UPDATE_TICKET_UNREAD_MESSAGES', { type: this.status, ticket: data.ticket });
          this.forceTicketListUpdate();
        }
      });
      
      // Limpar intervalo anterior se existir
      if (this.socketCheckInterval) {
        clearInterval(this.socketCheckInterval);
      }
      
      // Verificar conexão do socket a cada 30 segundos
      this.socketCheckInterval = setInterval(() => {
        this.verificarConexaoSocket();
      }, 30000);
    },
    
    tentarReconectar() {
      // Se já atingiu o número máximo de tentativas, espera mais tempo
      if (this.socketReconnectAttempts >= this.maxReconnectAttempts) {
        console.log(`Atingido limite máximo de ${this.maxReconnectAttempts} tentativas. Aguardando 60 segundos...`);
        setTimeout(() => {
          this.socketReconnectAttempts = 0;
          this.ticketListSocket();
        }, 60000);
        return;
      }
      
      this.socketReconnectAttempts++;
      const tempoEspera = Math.min(5000 * this.socketReconnectAttempts, 30000); // Espera exponencial, máximo 30s
      
      console.log(`Tentativa ${this.socketReconnectAttempts}: Reconectando socket em ${tempoEspera/1000} segundos...`);
      setTimeout(() => {
        if (!this.socket || !this.socket.connected) {
          console.log('Reconectando socket...');
          this.ticketListSocket(); // Reiniciar o socket completamente
        }
      }, tempoEspera);
    },
    
    verificarConexaoSocket() {
      console.log('Verificando conexão do socket...');
      if (!this.socket || !this.socket.connected) {
        console.log('Socket desconectado - reconectando...');
        this.ticketListSocket();
      } else {
        console.log('Socket está conectado');
        // Atualizar lista de tickets para garantir sincronização
        this.consultarTickets({ pageNumber: 1 });
      }
    },
    forceTicketListUpdate() {
      // Limpa qualquer timer existente para evitar múltiplas atualizações
      if (this.renderTimer) {
        clearTimeout(this.renderTimer);
      }
      
      // Usa um timer para debounce, garantindo que não atualizamos várias vezes em sequência
      this.renderTimer = setTimeout(() => {
        try {
          console.log('forceTicketListUpdate: forçando atualização da lista de tickets');
          
          // Incrementa a refreshKey para forçar o Vue a recriar os componentes ItemTicket
          this.refreshKey++;
          
          // Força a atualização do componente
          this.$forceUpdate();
          
          // Se necessário, notifica o componente pai para atualizar também
          if (this.$parent && this.$parent.$forceUpdate) {
            this.$parent.$forceUpdate();
          }
          
          // Garante que o Store também é atualizado
          if (this.cTickets && Array.isArray(this.cTickets)) {
            const tickets = [...this.cTickets];
            this.$store.commit('FORCE_REFRESH_TICKETS', tickets);
          }
          
          // Emite evento para qualquer componente que precise reagir
          this.$nextTick(() => {
            this.$root.$emit('tickets-updated');
          });
        } catch (error) {
          console.error('Erro ao forçar atualização:', error);
        }
      }, 100); // Pequeno delay para agrupar atualizações
    },
    registerPropWatchers (propNames) {
      propNames.forEach(propName => {
        this.$watch(propName, (newVal, oldVal) => {
          console.log('handle obsevablePropsSocket', propName);
          if (propName != 'searchParam') {
            if (this.socket) {
              this.socket.disconnect();
            }
            this.ticketListSocket();
          }
          this.consultarTickets({ pageNumber: 1 });
        });
      });
    },
    async getProfilePic(whatsappId) {
      return await this.$store.dispatch('fetchProfilePicUrl', whatsappId);
    }
  },
  mounted () {
    // this.consultarTickets()
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
