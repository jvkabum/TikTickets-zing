import { defineStore } from 'pinia'
import { LocalizarMensagens } from 'src/service/tickets'
import { computed, ref } from 'vue'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref([])
  const ticketFocado = ref({})
  const hasMore = ref(true)
  const loading = ref(false)
  const mensagens = ref([])
  const notifications = ref([])
  const notificationsP = ref([])

  const openTickets = computed(() => tickets.value.filter(t => t.status === 'open' && !t.isGroup))

  const pendingTickets = computed(() => tickets.value.filter(t => t.status === 'pending' && !t.isGroup))

  const closedTickets = computed(() => tickets.value.filter(t => t.status === 'closed' && !t.isGroup))

  const groupTickets = computed(() => tickets.value.filter(t => t.isGroup))

  function setTickets (data) {
    tickets.value = data
  }

  function addTickets (data) {
    // Evitar duplicados ao adicionar
    const uniqueTickets = data.filter(nt => !tickets.value.find(t => t.id === nt.id))
    tickets.value = [...tickets.value, ...uniqueTickets]
  }

  function updateTicket (ticket) {
    const idx = tickets.value.findIndex(t => t.id === ticket.id)
    if (idx !== -1) {
      tickets.value[idx] = { ...tickets.value[idx], ...ticket }
      if (ticketFocado.value.id === ticket.id) {
        ticketFocado.value = { ...ticketFocado.value, ...ticket }
      }
    } else {
      tickets.value.unshift(ticket)
    }
  }

  function deleteTicket (ticketId) {
    tickets.value = tickets.value.filter(t => t.id !== ticketId)
    if (ticketFocado.value.id === ticketId) {
      ticketFocado.value = {}
    }
  }

  function setTicketFocado (ticket) {
    ticketFocado.value = ticket
  }

  function setHasMore (value) {
    hasMore.value = value
  }

  function resetTickets () {
    tickets.value = []
    hasMore.value = true
  }

  function setMensagens (data) {
    mensagens.value = data
  }

  function addMensagem (msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx === -1) {
      mensagens.value.push(msg)
    }
  }

  function updateMensagem (msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) {
      mensagens.value[idx] = { ...mensagens.value[idx], ...msg }
    }
  }

  function updateMessageStatus (msg) {
    const idx = mensagens.value.findIndex(m => m.id === msg.id)
    if (idx !== -1) {
      mensagens.value[idx].ack = msg.ack
    }
  }

  function updateNotifications (data) {
    notifications.value = data.tickets
  }

  function updateNotificationsP (data) {
    notificationsP.value = data.tickets
  }

  function updateTicketContact (contact) {
    tickets.value.forEach(t => {
      if (t.contactId === contact.id) {
        t.contact = contact
      }
    })
    if (ticketFocado.value.contactId === contact.id) {
      ticketFocado.value.contact = contact
    }
  }

  async function consultarMensagens (params) {
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
    consultarMensagens
  }
})
