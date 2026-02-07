import {
  AtualizarStatusTicket,
  ConsultarTickets,
  CriarTicket,
  EncaminharMensagem,
  EnviarMensagemTexto,
  LocalizarMensagens,
  LocalizarProtocolos,
  SincronizarMensagensTicket
} from 'src/service/tickets'
import { notificarErro } from 'src/utils/helpersNotifications'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = reactive({
    open: [],
    pending: [],
    closed: [],
    groups: [],
    search: []
  })
  const ticketFocado = ref({})
  const hasMore = ref(true)
  const loading = ref(false)
  const mensagens = ref([])
  const notifications = ref([])
  const notificationsP = ref([])
  const protocolos = ref([]) // Novo state
  const ticketsCount = ref({
    open: 0,
    pending: 0,
    closed: 0,
    groups: 0
  })
  const drawerContact = ref(false)

  // Getters compatibility
  const openTickets = computed(() => tickets.open)
  const pendingTickets = computed(() => tickets.pending)
  const closedTickets = computed(() => tickets.closed)
  const groupTickets = computed(() => tickets.groups)

  function getTicketList(type) {
    if (type === 'search') return tickets.search
    if (type === 'groups') return tickets.groups
    if (['open', 'pending', 'closed'].includes(type)) return tickets[type]
    return tickets.search
  }

  function checkTicketFilter(ticket, expectedStatus = null) {
    const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || {
      status: ['open', 'pending', 'closed'],
      queuesIds: [],
      showAll: false,
      withUnreadMessages: false,
      isNotAssignedUser: false
    }
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const UserQueues = JSON.parse(localStorage.getItem('queues') || '[]')
    const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
    const profile = localStorage.getItem('profile')
    const isAdminShowAll = profile === 'admin' && filtros.showAll
    const isQueuesTenantExists = filasCadastradas.length > 0
    const userId = usuario?.userId || +localStorage.getItem('userId')

    // 0. Validação de status específica para o bucket (se não for busca geral)
    if (expectedStatus && expectedStatus !== 'search') {
      if (expectedStatus === 'groups') {
        if (!ticket.isGroup) return false
      } else {
        if (ticket.isGroup || ticket.status !== expectedStatus) return false
      }
    }

    // 1. Admin show all
    if (isAdminShowAll) return true

    // 2. Groups are always visible if tab selected
    if (ticket.isGroup) return true

    // 3. User assignment
    if (ticket.userId === userId) return true

    // 4. Queues
    if (isQueuesTenantExists) {
      const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
      if (isQueueUser === -1) return false // User doesn't have access to this queue
    }

    // 5. Filter by specific queues selected in UI
    if (filtros.queuesIds && filtros.queuesIds.length > 0) {
      if (!filtros.queuesIds.includes(ticket.queueId)) return false
    }

    // 6. Assigned to others?
    const NotViewAssignedTickets = () => {
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes') || '[]')
      const conf = configuracoes.find(c => c.key === 'NotViewAssignedTickets')
      return conf?.value === 'enabled'
    }

    if (NotViewAssignedTickets() && ticket.userId && ticket.userId !== userId) {
      return false
    }

    // 7. Not Assigned filter
    if (filtros.isNotAssignedUser && ticket.userId) {
      return false
    }

    return true
  }

  function setTickets(data, type = 'search') {
    if (tickets[type]) {
      // Filtrar antes de definir para garantir visibilidade correta
      tickets[type] = data.filter(t => checkTicketFilter(t, type))
    }
  }

  function addTickets(data, type = 'search') {
    if (tickets[type]) {
      const current = tickets[type]
      const filteredData = data.filter(t => checkTicketFilter(t, type))
      const uniqueTickets = filteredData.filter(nt => !current.find(t => t.id === nt.id))
      tickets[type] = [...current, ...uniqueTickets]
    }
  }

  function updateTicket(ticket) {
    // 1. Determinar a lista alvo baseada no estado atual do ticket e filtros
    let targetType = null
    const passesFilter = checkTicketFilter(ticket)

    if (ticket.isGroup) {
      targetType = 'groups'
    } else {
      if (['open', 'pending', 'closed'].includes(ticket.status)) {
        targetType = ticket.status
      }
    }

    // 2. Atualizar ou remover das listas existentes
    Object.keys(tickets).forEach(key => {
      const list = tickets[key]
      const idx = list.findIndex(t => t.id === ticket.id)

      if (idx !== -1) {
        // O ticket existe nesta lista. Verificar se ainda pertence a ela.
        let belongsHere = false
        if (key === 'search') belongsHere = true // Na busca, sempre atualiza se já estiver lá
        else if (key === 'groups' && ticket.isGroup) belongsHere = true
        else if (['open', 'pending', 'closed'].includes(key)) {
          if (!ticket.isGroup && ticket.status === key) belongsHere = true
        }

        // Além do status, deve respeitar os filtros gerais (Filas, Admin, etc)
        if (belongsHere && passesFilter) {
          // Atualiza in-place
          list[idx] = { ...list[idx], ...ticket }
        } else {
          // Remove da lista se mudou de status OU não passa mais no filtro
          list.splice(idx, 1)
        }
      }
    })

    // 3. Adicionar na lista correta se não existir lá e passar no filtro
    if (targetType && targetType !== 'search' && passesFilter) {
      const list = tickets[targetType]
      // Verificar novamente se já existe (pode ter sido atualizado no passo 2)
      const exists = list.find(t => t.id === ticket.id)
      if (!exists) {
        // Adiciona no topo
        list.unshift(ticket)
      }
    }

    if (ticketFocado.value.id === ticket.id) {
      ticketFocado.value = { ...ticketFocado.value, ...ticket }
    }
  }

  function deleteTicket(ticketId) {
    Object.keys(tickets).forEach(key => {
      tickets[key] = tickets[key].filter(t => t.id !== ticketId)
    })

    if (ticketFocado.value.id === ticketId) {
      ticketFocado.value = {}
    }
  }

  function setTicketFocado(ticket) {
    // Atualização otimista: se o ticket tem mensagens não lidas, zera agora
    if (ticket.unreadMessages > 0) {
      const updatedTicket = { ...ticket, unreadMessages: 0 }

      // Ajustar contadores globais preventivamente
      if (ticket.isGroup) {
        ticketsCount.value.groups = Math.max(0, ticketsCount.value.groups - 1)
      } else if (ticket.status === 'open') {
        ticketsCount.value.open = Math.max(0, ticketsCount.value.open - 1)
      } else if (ticket.status === 'pending') {
        ticketsCount.value.pending = Math.max(0, ticketsCount.value.pending - 1)
      }

      // Limpar das listas de notificações locais para consistência total
      notifications.value = notifications.value.filter(t => t.id !== ticket.id)
      notificationsP.value = notificationsP.value.filter(t => t.id !== ticket.id)

      ticketFocado.value = updatedTicket
      // Atualiza também na lista lateral para remover o badge vermelho imediatamente
      updateTicket(updatedTicket)
    } else {
      ticketFocado.value = ticket
    }
  }

  function setHasMore(value) {
    hasMore.value = value
  }

  function resetTickets(type) {
    if (type && tickets[type]) {
      tickets[type] = []
    } else {
      // Reset all if no type
      Object.keys(tickets).forEach(k => tickets[k] = [])
    }
    hasMore.value = true
  }

  function setMensagens(data) {
    mensagens.value = data
  }

  function addMensagem(msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx === -1) {
      mensagens.value.push(msg)
    }
  }

  function updateMensagem(msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) {
      mensagens.value[idx] = { ...mensagens.value[idx], ...msg }
    }
  }

  function updateMessageStatus(msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) {
      mensagens.value[idx].ack = msg.ack
    }
  }

  function updateNotifications(data) {
    notifications.value = data.tickets
    ticketsCount.value.open = data.count
  }

  function updateNotificationsP(data) {
    notificationsP.value = data.tickets
    ticketsCount.value.pending = data.count
  }

  function updateTicketContact(contact) {
    Object.keys(tickets).forEach(key => {
      tickets[key].forEach(t => {
        if (t.contactId === contact.id) {
          t.contact = contact
        }
      })
    })

    if (ticketFocado.value.contactId === contact.id) {
      ticketFocado.value.contact = contact
    }
  }

  async function consultarMensagens(params) {
    loading.value = true
    try {
      const { data } = await LocalizarMensagens(params)
      if (params.pageNumber === 1) {
        mensagens.value = data.messages
      } else {
        // Concatenar e remover duplicados
        const newMessages = data.messages.filter(nm => !mensagens.value.find(m => m.id === nm.id))
        mensagens.value = [...newMessages, ...mensagens.value]
      }
      hasMore.value = data.hasMore
      return data
    } catch (error) {
      console.error('Erro ao consultar mensagens', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function consultarTickets(params, isLoadMore = false) {
    loading.value = true
    try {
      const { data } = await ConsultarTickets(params)

      // Determinar o tipo de lista a atualizar
      let type = 'search'
      if (params.isGroup) {
        type = 'groups'
      } else if (params.status && params.status.length === 1) {
        type = params.status[0]
      }

      if (isLoadMore) {
        addTickets(data.tickets, type)
      } else {
        setTickets(data.tickets, type)
      }
      setHasMore(data.hasMore)

      // Atualizar contagem global conforme o status pesquisado
      if (params.isGroup) {
        ticketsCount.value.groups = data.count
      } else if (params.status && params.status.length === 1) {
        const status = params.status[0]
        if (ticketsCount.value[status] !== undefined) {
          ticketsCount.value[status] = data.count
        }
      }

      return data
    } catch (error) {
      notificarErro('Erro ao carregar tickets', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function encaminharMensagem(messages, contact) {
    try {
      await EncaminharMensagem(messages, contact)
    } catch (error) {
      notificarErro('Erro ao encaminhar mensagem', error)
      throw error
    }
  }

  async function enviarMensagem(ticketId, formData) {
    try {
      const { data } = await EnviarMensagemTexto(ticketId, formData)
      return data
    } catch (error) {
      throw error
    }
  }

  async function sincronizarMensagens(ticketId) {
    try {
      await SincronizarMensagensTicket(ticketId)
    } catch (error) {
      notificarErro('Erro ao sincronizar mensagens', error)
      throw error
    }
  }

  async function atualizarStatusTicket(ticketId, status) {
    try {
      const { data } = await AtualizarStatusTicket(ticketId, status)
      updateTicket(data)
      return data
    } catch (error) {
      notificarErro('Erro ao atualizar status do ticket', error)
      throw error
    }
  }

  async function criarTicket(data) {
    try {
      const { data: res } = await CriarTicket(data)
      updateTicket(res)
      return res
    } catch (error) {
      console.error('Erro ao criar ticket', error)
      throw error
    }
  }

  async function listarProtocolos(ticketId) {
    try {
      const { data } = await LocalizarProtocolos(ticketId)
      protocolos.value = Array.isArray(data) ? data : []
      return protocolos.value
    } catch (error) {
      console.error('Erro ao listar protocolos', error)
      protocolos.value = []
      return []
    }
  }

  async function atualizarContadoresGerais(filtrosAtuais = {}) {
    // Mesclar filtros atuais com baseParams para respeitar showAll, queuesIds, etc.
    const baseParams = {
      searchParam: '',
      pageNumber: 1,
      showAll: filtrosAtuais.showAll || false,
      queuesIds: filtrosAtuais.queuesIds || [],
      tagsIds: filtrosAtuais.tagsIds || [],
      withUnreadMessages: filtrosAtuais.withUnreadMessages || false,
      isNotAssignedUser: filtrosAtuais.isNotAssignedUser || false,
      includeNotQueueDefined: true,
      limit: 1 // Queremos apenas o count, não os tickets
    }

    try {
      // Aberto
      const { data: openData } = await ConsultarTickets({ ...baseParams, status: ['open'] })
      ticketsCount.value.open = openData.count || 0

      // Pendente
      const { data: pendingData } = await ConsultarTickets({ ...baseParams, status: ['pending'] })
      ticketsCount.value.pending = pendingData.count || 0

      // Fechado
      const { data: closedData } = await ConsultarTickets({ ...baseParams, status: ['closed'] })
      ticketsCount.value.closed = closedData.count || 0

      // Grupos
      const { data: groupsData } = await ConsultarTickets({ ...baseParams, status: ['open', 'pending'], isGroup: true })
      ticketsCount.value.groups = groupsData.count || 0
    } catch (error) {
      console.error('Erro ao sincronizar contadores globais', error)
    }
  }

  return {
    tickets,
    ticketFocado,
    hasMore,
    loading,
    mensagens,
    notifications,
    notificationsP,
    openTickets,
    pendingTickets,
    closedTickets,
    groupTickets,
    setTickets,
    addTickets,
    updateTicket,
    deleteTicket,
    setTicketFocado,
    setHasMore,
    resetTickets,
    setMensagens,
    addMensagem,
    updateMensagem,
    updateMessageStatus,
    updateNotifications,
    updateNotificationsP,
    updateTicketContact,
    consultarMensagens,
    consultarTickets,
    encaminharMensagem,
    enviarMensagem,
    sincronizarMensagens,
    atualizarStatusTicket,
    criarTicket,
    listarProtocolos,
    protocolos,
    getTicketList,
    ticketsCount,
    drawerContact,
    atualizarContadoresGerais
  }
})
