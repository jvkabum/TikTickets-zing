const checkTicketFilter = ticket => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    tagsIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  }

  const getConfig = (key) => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes') || '[]')
    const conf = configuracoes?.find(c => c.key === key)
    return conf?.value === 'enabled' || conf?.value === 'true' || conf?.value === true
  }

  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues') || '[]')
  const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
  const profile = localStorage.getItem('profile')
  const isAdminShowAll = profile === 'admin' && filtros.showAll
  const isQueuesTenantExists = filasCadastradas.length > 0

  const userId = usuario?.id || +localStorage.getItem('userId')

  // Verificar se é admin e se está solicitando para mostrar todos
  if (isAdminShowAll) {
    return true
  }

  // se ticket for um grupo, todos podem verificar.
  if (ticket.isGroup) {
    return true
  }

  // se status do ticket diferente do status filtrado, retornar false
  if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
    return false
  }

  // verificar se já é um ticket do usuário
  if (ticket?.userId == userId) {
    return true
  }

  // Não visualizar tickets ainda com o Chatbot
  if (getConfig('NotViewTicketsChatBot') && ticket.autoReplyId) {
    if (!ticket?.userId && !ticket.queueId) {
      return false
    }
  }

  // verificar se o usuário possui fila liberada
  if (isQueuesTenantExists) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser === -1) {
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (isQueuesTenantExists && filtros?.queuesIds?.length) {
    const isQueue = filtros.queuesIds.includes(ticket.queueId)
    if (!isQueue) {
      return false
    }
  }

  // se configuração para carteira ativa
  if (getConfig('DirectTicketsToWallets') && (ticket?.contact?.wallets?.length || 0) > 0) {
    const idx = ticket?.contact?.wallets.findIndex(w => w.id == userId)
    if (idx !== -1) {
      return true
    }
    return false
  }

  // verificar se o parametro para não permitir visualizar tickets atribuidos à outros está ativo
  if (getConfig('NotViewAssignedTickets') && ticket?.userId && ticket.userId !== userId) {
    return false
  }

  // verificar se filtro somente tickets não assinados ativo
  if (filtros.isNotAssignedUser) {
    return !ticket.userId
  }

  // verificar se há filtro de tags ativo
  if (filtros.tagsIds && filtros.tagsIds.length > 0) {
    const ticketTags = ticket.contact?.tags?.map(t => t.id) || []
    const hasMatchingTag = filtros.tagsIds.some(tagId => ticketTags.includes(tagId))
    if (!hasMatchingTag) {
      return false
    }
  }

  return true
}

export default checkTicketFilter
