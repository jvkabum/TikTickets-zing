import { parseISO } from 'date-fns'
import { orderBy } from 'lodash'
import { Notify } from 'quasar'
import { RouterInstance as $router } from 'src/router'
import { ConsultarDadosTicket, LocalizarMensagens } from 'src/service/tickets'

const orderMessages = (messages) => {
  const newMessages = orderBy(messages, (obj) => parseISO(obj.timestamp || obj.createdAt), ['asc'])
  return [...newMessages]
}

const orderTickets = (tickets) => {
  const newTickets = orderBy(tickets, [
    // Primeiro ordena por mensagens não lidas (desc para colocar tickets com unreadMessages > 0 no topo)
    ticket => ticket.unreadMessages > 0,
    // Depois ordena por data da última mensagem (do mais recente para o mais antigo)
    ticket => {
      // Pegar o timestamp e convertê-lo para um objeto Date
      let date
      try {
        if (ticket.lastMessageAt) {
          // Se for um timestamp numérico em string, criar data a partir do número
          if (!isNaN(Number(ticket.lastMessageAt))) {
            const timestampNum = Number(ticket.lastMessageAt)

            // Verificar se é timestamp em segundos (10 dígitos) e converter para milissegundos
            if (timestampNum > 1000000000 && timestampNum < 9999999999) {
              console.log('Convertendo timestamp de segundos para milissegundos:', timestampNum)
              date = new Date(timestampNum * 1000)
            } else if (timestampNum > 1262304000000) { // Verificar se o timestamp em milissegundos é válido (após 2010)
              date = new Date(timestampNum)
            } else {
              console.warn('Timestamp muito antigo ou inválido:', timestampNum)
              date = new Date() // Usar data atual para ordenação
            }
          } else {
            // Caso contrário, tentar parseIso
            date = parseISO(ticket.lastMessageAt)

            // Verificar se a data parseada é válida
            if (isNaN(date.getTime())) {
              console.warn('Data parseada inválida:', ticket.lastMessageAt)
              date = new Date() // Usar data atual para valores inválidos
            }
          }
        } else if (ticket.updatedAt) {
          try {
            date = parseISO(ticket.updatedAt)
            if (isNaN(date.getTime())) {
              console.warn('updatedAt inválido:', ticket.updatedAt)
              date = new Date()
            }
          } catch (e) {
            console.warn('Erro ao parsear updatedAt:', e)
            date = new Date()
          }
        } else {
          // Se nenhuma data válida, usar a data atual (para evitar ordenações inconsistentes)
          date = new Date()
        }
        return date
      } catch (e) {
        console.error('Erro ao converter data:', e, ticket)
        return new Date() // Em caso de erro, usar data atual
      }
    }
  ], ['desc', 'desc'])
  return [...newTickets]
}

const checkTicketFilter = (ticket) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
    // date: new Date(),
  }

  const NotViewTicketsChatBot = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'NotViewTicketsChatBot')
    return (conf?.value === 'enabled')
  }

  const DirectTicketsToWallets = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'DirectTicketsToWallets')
    return (conf?.value === 'enabled')
  }

  const isNotViewAssignedTickets = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
    return (conf?.value === 'enabled')
  }
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues'))
  const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
  const profile = localStorage.getItem('profile')
  const isAdminShowAll = profile === 'admin' && filtros.showAll
  const isQueuesTenantExists = filasCadastradas.length > 0

  const userId = usuario?.userId || +localStorage.getItem('userId')

  // Verificar se é admin e se está solicitando para mostrar todos
  if (isAdminShowAll) {
    console.log('isAdminShowAll', isAdminShowAll)
    return true
  }

  // se ticket for um grupo, todos podem verificar.
  if (ticket.isGroup) {
    console.log('ticket.isGroup', ticket.isGroup)
    return true
  }

  // se status do ticket diferente do staatus filtrado, retornar false
  if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
    console.log('Status ticket', filtros.status, ticket.status)
    return false
  }

  // verificar se já é um ticket do usuário
  if (ticket?.userId == userId) {
    console.log('Ticket do usuário', ticket?.userId, userId)
    return true
  }

  // Não visualizar tickets ainda com o Chatbot
  // desde que ainda não exista usuário ou fila definida
  if (NotViewTicketsChatBot() && ticket.autoReplyId) {
    if (!ticket?.userId && !ticket.queueId) {
      console.log('NotViewTicketsChatBot e o ticket está sem usuário e fila definida')
      return false
    }
  }

  // Se o ticket não possuir fila definida, checar o filtro
  // permite visualizar tickets sem filas definidas é falso.
  // if (isQueuesTenantExists && !ticket.queueId && !filtros.includeNotQueueDefined) {
  //   console.log('filtros.includeNotQueueDefined', ticket.queueId, !filtros.includeNotQueueDefined)
  //   return false
  // }

  let isValid = true

  // verificar se o usuário possui fila liberada
  if (isQueuesTenantExists) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      console.log('Fila do ticket liberada para o Usuario', ticket.queueId)
      isValid = true
    } else {
      console.log('Usuario não tem acesso a fila', ticket.queueId)
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (isQueuesTenantExists && filtros?.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue == -1) {
      console.log('filas filtradas e diferentes da do ticket', ticket.queueId)
      return false
    }
  }

  // se configuração para carteira ativa: verificar se já é um ticket da carteira do usuário
  if (DirectTicketsToWallets() && (ticket?.contact?.wallets?.length || 0) > 0) {
    const idx = ticket?.contact?.wallets.findIndex(w => w.id == userId)
    if (idx !== -1) {
      console.log('Ticket da carteira do usuário')
      return true
    }
    console.log('DirectTicketsToWallets: Ticket não pertence à carteira do usuário', ticket)
    return false
  }

  // verificar se o parametro para não permitir visualizar
  // tickets atribuidos à outros usuários está ativo
  if (isNotViewAssignedTickets() && (ticket?.userId || userId) !== userId) {
    console.log('isNotViewAssignedTickets e ticket não é do usuário', ticket?.userId, userId)
    // se usuário não estiver atribuido, permitir visualizar
    if (!ticket?.userId) {
      return true
    }
    return false
  }

  // verificar se filtro somente tickets não assinados (isNotAssingned) ativo
  if (filtros.isNotAssignedUser) {
    console.log('isNotAssignedUser ativo para exibir somente tickets não assinados', filtros.isNotAssignedUser, !ticket.userId)
    return filtros.isNotAssignedUser && !ticket.userId
  }

  return isValid
}

const atendimentoTicket = {
  state: {
    chatTicketDisponivel: false,
    tickets: [],
    ticketsCache: new Map(),
    mensagensCache: new Map(), // Cache para mensagens
    ticketFocado: {
      contacts: {
        tags: [],
        wallets: [],
        extraInfo: []
      }
    },
    hasMore: false,
    contatos: [],
    mensagens: []
  },
  mutations: {
    // OK
    SET_HAS_MORE(state, payload) {
      state.hasMore = payload
    },
    // OK
    LOAD_TICKETS(state, payload) {
      // Se for um array, iterar sobre cada ticket
      const tickets = Array.isArray(payload.tickets) ? payload.tickets : payload
      console.log('LOAD_TICKETS', tickets.length, 'tickets')

      // Nova abordagem para garantir reatividade
      const updatedTickets = [...state.tickets]
      let hasChanges = false

      // Para cada ticket novo ou atualizado
      tickets.forEach(ticket => {
        if (checkTicketFilter(ticket)) {
          // Atualizar cache
          state.ticketsCache.set(ticket.id, ticket)

          // Verificar se o ticket já existe
          const existingIndex = updatedTickets.findIndex(t => t.id === ticket.id)

          if (existingIndex !== -1) {
            // Atualizar ticket existente
            if (JSON.stringify(updatedTickets[existingIndex]) !== JSON.stringify({
              ...updatedTickets[existingIndex],
              ...ticket
            })) {
              updatedTickets[existingIndex] = {
                ...updatedTickets[existingIndex],
                ...ticket
              }
              hasChanges = true
            }
          } else {
            // Adicionar novo ticket
            updatedTickets.push(ticket)
            hasChanges = true
          }
        }
      })

      // Só reordena e atualiza se houve mudanças
      if (hasChanges) {
        console.log('LOAD_TICKETS aplicando mudanças')
        state.tickets = orderTickets(updatedTickets.filter(t => checkTicketFilter(t)))
      }
    },
    // Nova mutação para forçar atualização dos tickets
    FORCE_REFRESH_TICKETS(state, tickets) {
      try {
        console.log('FORCE_REFRESH_TICKETS: Forçando atualização dos tickets', tickets.length)

        // Se temos tickets específicos para atualizar
        if (Array.isArray(tickets) && tickets.length > 0) {
          // Criar uma cópia dos tickets atuais
          const updatedTickets = [...state.tickets]
          let hasChanges = false

          // Para cada ticket, verificar se existe e atualizar
          tickets.forEach(ticket => {
            if (ticket && ticket.id) {
              const index = updatedTickets.findIndex(t => t.id === ticket.id)
              if (index !== -1) {
                // Verificar se há diferenças
                if (JSON.stringify(updatedTickets[index]) !== JSON.stringify(ticket)) {
                  updatedTickets[index] = { ...ticket }
                  hasChanges = true
                }
              }
            }
          })

          // Se houve mudanças, atualizar o estado
          if (hasChanges) {
            state.tickets = orderTickets(updatedTickets)
          }
        } else {
          // Se não temos tickets específicos, apenas reordenar os existentes para forçar reatividade
          state.tickets = orderTickets([...state.tickets])
        }
      } catch (error) {
        console.error('Erro em FORCE_REFRESH_TICKETS:', error)
      }
    },
    RESET_TICKETS(state) {
      state.hasMore = true
      state.tickets = []
    },
    RESET_UNREAD(state, payload) {
      console.log('RESET_UNREAD chamado para ticket:', payload.ticketId)
      const tickets = [...state.tickets]
      const ticketId = payload.ticketId
      const ticketIndex = tickets.findIndex(t => t.id === ticketId)

      if (ticketIndex !== -1) {
        console.log('RESET_UNREAD encontrou ticket:', ticketId)
        tickets[ticketIndex] = {
          ...tickets[ticketIndex],
          ...payload,
          unreadMessages: 0
        }
        state.tickets = orderTickets(tickets.filter(t => checkTicketFilter(t)))
      }
    },
    UPDATE_TICKET(state, payload) {
      console.log('UPDATE_TICKET chamado para ticket:', payload.id || payload.ticket?.id)
      // Determinar o ticket a ser atualizado
      const ticketData = payload.ticket || payload

      // Atualizar cache
      state.ticketsCache.set(ticketData.id, ticketData)

      const ticketIndex = state.tickets.findIndex(t => t.id === ticketData.id)
      if (ticketIndex !== -1) {
        // Atualizar ticket existente
        const tickets = [...state.tickets]
        const updatedTicket = {
          ...tickets[ticketIndex],
          ...ticketData,
          username: ticketData?.user?.name || ticketData?.username || tickets[ticketIndex].username,
          profilePicUrl: ticketData?.contact?.profilePicUrl || ticketData?.profilePicUrl || tickets[ticketIndex].profilePicUrl,
          name: ticketData?.contact?.name || ticketData?.name || tickets[ticketIndex].name
        }

        // Verificar se há mudanças reais
        if (JSON.stringify(tickets[ticketIndex]) !== JSON.stringify(updatedTicket)) {
          console.log('UPDATE_TICKET atualizando ticket existente:', ticketData.id)
          tickets[ticketIndex] = updatedTicket
          state.tickets = orderTickets(tickets.filter(t => checkTicketFilter(t)))
        }

        // Atualizar ticket focado
        if (state.ticketFocado.id === ticketData.id) {
          state.ticketFocado = {
            ...state.ticketFocado,
            ...ticketData
          }
        }
      } else if (checkTicketFilter(ticketData)) {
        // Adicionar novo ticket
        console.log('UPDATE_TICKET adicionando novo ticket:', ticketData.id)
        const tickets = [...state.tickets]
        const newTicket = {
          ...ticketData,
          username: ticketData?.user?.name || ticketData?.username,
          profilePicUrl: ticketData?.contact?.profilePicUrl || ticketData?.profilePicUrl,
          name: ticketData?.contact?.name || ticketData?.name
        }
        tickets.push(newTicket)
        state.tickets = orderTickets(tickets.filter(t => checkTicketFilter(t)))
      }
    },
    DELETE_TICKET(state, payload) {
      const ticketId = payload.ticketId || payload
      console.log('DELETE_TICKET chamado para ticket:', ticketId)

      // Remover do cache
      state.ticketsCache.delete(ticketId)

      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        console.log('DELETE_TICKET removendo ticket:', ticketId)
        // Criar uma nova cópia do array para garantir reatividade
        const tickets = [...state.tickets]
        tickets.splice(ticketIndex, 1)
        state.tickets = tickets
      }
    },
    UPDATE_TICKET_FOCADO_CONTACT(state, payload) {
      state.ticketFocado.contact = payload
    },
    UPDATE_CONTACT(state, payload) {
      if (state.ticketFocado.contactId == payload.id) {
        state.ticketFocado.contact = payload
      }
      const ticketIndex = state.tickets.findIndex(t => t.contactId === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...state.tickets]
        tickets[ticketIndex].contact = payload
        tickets[ticketIndex].name = payload.name
        tickets[ticketIndex].profilePicUrl = payload.profilePicUrl
        state.tickets = tickets
      }
    },
    // OK
    TICKET_FOCADO(state, payload) {
      const params = {
        ...payload,
        status: payload.status == 'pending' ? 'open' : payload.status,
        whatsapp: {
          ...payload.whatsapp,
          profilePicUrl: payload.whatsapp?.profilePicUrl || state.ticketFocado?.whatsapp?.profilePicUrl
        }
      }
      state.ticketFocado = params
    },
    // OK
    LOAD_INITIAL_MESSAGES(state, payload) {
      const { messages, messagesOffLine } = payload
      state.mensagens = []
      // Atualizar cache de mensagens
      const allMessages = [...messages, ...messagesOffLine]
      allMessages.forEach(msg => {
        state.mensagensCache.set(msg.id, msg)
      })
      const newMessages = orderMessages(allMessages)
      state.mensagens = newMessages
    },
    // OK
    LOAD_MORE_MESSAGES(state, payload) {
      const { messages, messagesOffLine } = payload
      const arrayMessages = [...messages, ...messagesOffLine]
      const newMessages = []
      // Verificar cache e atualizar mensagens
      arrayMessages.forEach(message => {
        state.mensagensCache.set(message.id, message)
        const messageIndex = state.mensagens.findIndex(m => m.id === message.id)
        if (messageIndex !== -1) {
          state.mensagens[messageIndex] = message
        } else {
          newMessages.push(message)
        }
      })
      const messagesOrdered = orderMessages(newMessages)
      state.mensagens = [...messagesOrdered, ...state.mensagens]
    },
    // OK
    UPDATE_MESSAGES(state, payload) {
      console.log('UPDATE_MESSAGES chamado para mensagem:', payload.id)

      // Verificar e corrigir timestamp se necessário
      if (!payload.timestamp || isNaN(Number(payload.timestamp))) {
        console.log('Corrigindo timestamp inválido para mensagem:', payload.id)
        payload.timestamp = Date.now().toString()
      }

      // Atualizar mensagens do ticket focado
      if (state.ticketFocado.id === payload.ticket?.id) {
        // Atualizar cache
        state.mensagensCache.set(payload.id, payload)

        // Atualizar array de mensagens
        const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
        const mensagens = [...state.mensagens]

        if (messageIndex !== -1) {
          // Verificar se há mudanças reais
          if (JSON.stringify(mensagens[messageIndex]) !== JSON.stringify(payload)) {
            console.log('UPDATE_MESSAGES atualizando mensagem existente:', payload.id)
            mensagens[messageIndex] = payload
            state.mensagens = mensagens
          }
        } else {
          console.log('UPDATE_MESSAGES adicionando nova mensagem:', payload.id)
          mensagens.push(payload)
          state.mensagens = mensagens
        }

        // Atualizar mensagens agendadas se for o caso
        if (payload.scheduleDate && payload.status == 'pending') {
          const scheduledMessages = [...(state.ticketFocado.scheduledMessages || [])]
          const idxScheduledMessages = scheduledMessages.findIndex(m => m.id === payload.id)

          if (idxScheduledMessages === -1) {
            console.log('UPDATE_MESSAGES adicionando mensagem agendada:', payload.id)
            scheduledMessages.push(payload)
            state.ticketFocado = {
              ...state.ticketFocado,
              scheduledMessages
            }
          }
        }
      }

      // Atualizar o ticket correspondente
      const ticketId = payload.ticket?.id
      if (!ticketId) return

      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex === -1) return

      // Preparar updates para o ticket
      const tickets = [...state.tickets]
      const unreadMessages = state.ticketFocado.id === ticketId ? 0
        : payload.fromMe ? tickets[ticketIndex].unreadMessages
          : (tickets[ticketIndex].unreadMessages || 0) + 1

      // Verificar e corrigir timestamp se necessário
      let timestamp = payload.timestamp || Date.now().toString()

      // Se for um número válido
      if (!isNaN(Number(timestamp))) {
        const timestampNum = Number(timestamp)
        // Verificar se é timestamp em segundos (10 dígitos) e converter para milissegundos
        if (timestampNum > 1000000000 && timestampNum < 9999999999) {
          console.log('UPDATE_MESSAGES: Convertendo timestamp de segundos para milissegundos:', timestampNum)
          timestamp = (timestampNum * 1000).toString()
        } else if (timestampNum > 2524608000000) { // Verificar se o timestamp é muito no futuro (após 2050)
          console.warn('UPDATE_MESSAGES: Timestamp muito no futuro, corrigindo:', timestampNum)
          timestamp = Date.now().toString()
        }
      } else {
        console.warn('UPDATE_MESSAGES: Timestamp inválido, usando tempo atual')
        timestamp = Date.now().toString()
      }

      const updatedTicket = {
        ...tickets[ticketIndex],
        answered: payload.ticket.answered,
        unreadMessages,
        lastMessage: payload.mediaName || payload.body,
        lastMessageAt: timestamp
      }

      // Verificar se há mudanças reais
      if (JSON.stringify(tickets[ticketIndex]) !== JSON.stringify(updatedTicket)) {
        console.log('UPDATE_MESSAGES atualizando ticket:', ticketId)
        tickets[ticketIndex] = updatedTicket
        state.tickets = orderTickets(tickets.filter(t => checkTicketFilter(t)))
      }
    },
    // OK
    UPDATE_MESSAGE_STATUS(state, payload) {
      // Se ticket não for o focado, não atualizar.
      if (state.ticketFocado.id != payload.ticket.id) {
        return
      }
      const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
      const mensagens = [...state.mensagens]
      if (messageIndex !== -1) {
        mensagens[messageIndex] = payload
        state.mensagens = mensagens
      }

      // Se existir mensagens agendadas no ticket focado,
      // tratar a atualização das mensagens deletadas.
      if (state.ticketFocado?.scheduledMessages) {
        const scheduledMessages = [...state.ticketFocado.scheduledMessages]
        const scheduled = scheduledMessages.filter(m => m.id != payload.id)
        state.ticketFocado.scheduledMessages = scheduled
      }
    },
    UPDATE_MESSAGE(state, payload) {
      // Se ticket não for o focado, não atualizar.
      if (state.ticketFocado.id != payload.ticketId) {
        return
      }

      state.mensagens = state.mensagens.map((m) => {
        if (m.id == payload.id) {
          return { ...m, ...payload }
        }

        return m
      })

      if (state.ticketFocado?.scheduledMessages) {
        state.ticketFocado.scheduledMessages = state.ticketFocado.scheduledMessages.map((m) => {
          if (m.id == payload.id) {
            return { ...m, ...payload }
          }

          return m
        })
      }
    },
    // OK
    RESET_MESSAGE(state) {
      state.mensagens = []
      state.mensagensCache.clear() // Limpar cache ao resetar
    },
    // Adicionar mutation UPDATE_TICKET_UNREAD_MESSAGES que está sendo usada no socket mas não está implementada
    UPDATE_TICKET_UNREAD_MESSAGES(state, payload) {
      // Suportar diferentes formatos de payload que podem vir do socket
      let ticket

      if (payload.ticket) {
        ticket = payload.ticket
      } else if (payload.id) {
        // Se o payload for o próprio ticket
        ticket = payload
      } else {
        console.error('Formato de payload inválido em UPDATE_TICKET_UNREAD_MESSAGES:', payload)
        return
      }

      console.log('UPDATE_TICKET_UNREAD_MESSAGES processando ticket:', ticket.id)

      // Garantir que o lastMessageAt seja válido
      if (!ticket.lastMessageAt || isNaN(Number(ticket.lastMessageAt))) {
        console.log('Corrigindo lastMessageAt inválido em UPDATE_TICKET_UNREAD_MESSAGES para ticket:', ticket.id)
        ticket.lastMessageAt = Date.now().toString()
      } else if (ticket.updatedAt && !ticket.lastMessageAt) {
        ticket.lastMessageAt = new Date(ticket.updatedAt).getTime().toString()
      }

      const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)

      if (ticketIndex !== -1) {
        // Corrigir timestamp se necessário
        if (ticket.lastMessageAt && !isNaN(Number(ticket.lastMessageAt))) {
          const timestampNum = Number(ticket.lastMessageAt)
          // Verificar se é timestamp em segundos (10 dígitos) e converter para milissegundos
          if (timestampNum > 1000000000 && timestampNum < 9999999999) {
            console.log('UPDATE_TICKET_UNREAD_MESSAGES: Convertendo timestamp de segundos para milissegundos:', timestampNum)
            ticket.lastMessageAt = (timestampNum * 1000).toString()
          } else if (timestampNum > 2524608000000) { // Verificar se o timestamp é muito no futuro (após 2050)
            console.warn('UPDATE_TICKET_UNREAD_MESSAGES: Timestamp muito no futuro, corrigindo:', timestampNum)
            ticket.lastMessageAt = Date.now().toString()
          }
        } else if (!ticket.lastMessageAt) {
          console.log('UPDATE_TICKET_UNREAD_MESSAGES: Sem timestamp, usando tempo atual')
          ticket.lastMessageAt = Date.now().toString()
        }

        // Atualizar ticket existente
        const tickets = [...state.tickets]
        const updatedTicket = {
          ...tickets[ticketIndex],
          ...ticket,
          unreadMessages: ticket.unreadMessages || tickets[ticketIndex].unreadMessages + 1,
          lastMessage: ticket.lastMessage || tickets[ticketIndex].lastMessage,
          lastMessageAt: ticket.lastMessageAt
        }

        // Verificar se realmente houve mudança
        if (JSON.stringify(tickets[ticketIndex]) !== JSON.stringify(updatedTicket)) {
          console.log('UPDATE_TICKET_UNREAD_MESSAGES atualizando ticket existente:', ticket.id)
          tickets[ticketIndex] = updatedTicket
          state.tickets = orderTickets(tickets.filter(t => checkTicketFilter(t)))
        }
      } else if (checkTicketFilter(ticket)) {
        // Adicionar novo ticket se passar no filtro
        console.log('UPDATE_TICKET_UNREAD_MESSAGES adicionando novo ticket:', ticket.id)
        const tickets = [...state.tickets]
        tickets.push(ticket)
        state.tickets = orderTickets(tickets)
      }

      // Se o ticket estiver focado, redefine contagem de não lidas
      if (state.ticketFocado.id === ticket.id) {
        const idx = state.tickets.findIndex(t => t.id === ticket.id)
        if (idx !== -1) {
          // Criar uma nova referência para garantir reatividade
          const tickets = [...state.tickets]
          tickets[idx] = { ...tickets[idx], unreadMessages: 0 }
          state.tickets = tickets
        }
      }
    }
  },
  actions: {
    async LocalizarMensagensTicket({ commit, state }, params) {
      try {
        // Verificar cache primeiro
        if (params.pageNumber === 1) {
          const cachedMessages = Array.from(state.mensagensCache.values())
          if (cachedMessages.length > 0) {
            commit('LOAD_INITIAL_MESSAGES', {
              messages: cachedMessages,
              messagesOffLine: []
            })
            return
          }
        }
        const mensagens = await LocalizarMensagens(params)
        commit('SET_HAS_MORE', mensagens.data.hasMore)
        if (params.pageNumber === 1) {
          commit('LOAD_INITIAL_MESSAGES', mensagens.data)
        } else {
          commit('LOAD_MORE_MESSAGES', mensagens.data)
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error)
        throw error
      }
    },
    async AbrirChatMensagens({ commit, dispatch }, data) {
      try {
        await commit('TICKET_FOCADO', {})
        await commit('RESET_MESSAGE')
        const ticket = await ConsultarDadosTicket(data)
        await commit('TICKET_FOCADO', ticket.data)
        // commit('SET_HAS_MORE', true)
        const params = {
          ticketId: data.id,
          pageNumber: 1
        }
        await dispatch('LocalizarMensagensTicket', params)

        await $router.push({ name: 'chat', params, query: { t: new Date().getTime() } })
      } catch (error) {
        // posteriormente é necessário investigar o motivo de está caindo em erro
        if (!error) return
        const errorMsg = error?.response?.data?.error
        if (errorMsg) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error,
            progress: true,
            position: 'top'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: `Ops... Ocorreu um problema não identificado. ${JSON.stringify(error)}`,
            progress: true,
            position: 'top'
          })
        }
      }
    }
  }
}

export default atendimentoTicket
