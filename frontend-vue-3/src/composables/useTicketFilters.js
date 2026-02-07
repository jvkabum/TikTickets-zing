import { computed, reactive } from 'vue'

/**
 * Composable para gerenciar filtros de tickets
 * Substitui a lógica duplicada de checkTicketFilter.js
 */
export function useTicketFilters() {
    const storage = useAppLocalStorage()
    const config = useConfiguracoes()
    const permissoes = usePermissoes()

    const filtros = reactive({
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
    })

    /**
     * Carrega filtros salvos do localStorage
     */
    const carregarFiltros = () => {
        const saved = storage.getFiltrosAtendimento()
        if (saved) Object.assign(filtros, saved)
        filtros.pageNumber = 1 // Sempre resetar para a primeira página ao carregar
    }

    /**
     * Salva filtros no localStorage
     */
    const salvarFiltros = () => {
        const { pageNumber, ...filtrosSave } = filtros
        storage.setFiltrosAtendimento(filtrosSave)
    }

    /**
     * Limpa todos os filtros para o padrão
     */
    const limparFiltros = () => {
        filtros.searchParam = ''
        filtros.pageNumber = 1
        filtros.status = ['open', 'pending', 'closed']
        filtros.showAll = false
        filtros.queuesIds = []
        filtros.tagsIds = []
        filtros.withUnreadMessages = false
        filtros.isNotAssignedUser = false
        filtros.includeNotQueueDefined = true
        salvarFiltros()
    }

    /**
     * Verifica se há filtros ativos além do padrão
     */
    const hasFiltrosAtivos = computed(() => {
        return (
            filtros.queuesIds.length > 0 ||
            filtros.tagsIds.length > 0 ||
            filtros.showAll ||
            filtros.withUnreadMessages ||
            filtros.isNotAssignedUser ||
            filtros.searchParam !== ''
        )
    })

    /**
     * Verifica se um ticket passa pelos filtros atuais
     */
    const checkTicketFilter = (ticket) => {
        const userId = storage.getUserId()
        const userQueues = storage.getUserQueues()
        const filasCadastradas = storage.getFilasCadastradas()
        const isQueuesTenantExists = filasCadastradas.length > 0

        // Admin com showAll pode ver tudo
        if (permissoes.isAdmin.value && filtros.showAll) {
            return true
        }

        // Grupos são visíveis para todos
        if (ticket.isGroup) {
            return true
        }

        // Status diferente do filtrado
        if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
            return false
        }

        // Ticket do próprio usuário
        if (ticket?.userId === userId) {
            return true
        }

        // Não visualizar tickets com chatbot ativo
        if (config.notViewTicketsChatBot.value && ticket.autoReplyId) {
            if (!ticket?.userId && !ticket.queueId) {
                return false
            }
        }

        // Verificar acesso à fila
        if (isQueuesTenantExists) {
            const isQueueUser = userQueues.findIndex(q => ticket.queueId === q.id)
            if (isQueueUser === -1) {
                return false
            }
        }

        // Verificar filtro de filas
        if (isQueuesTenantExists && filtros.queuesIds.length > 0) {
            if (!filtros.queuesIds.includes(ticket.queueId)) {
                return false
            }
        }

        // Verificar carteiras
        if (config.directTicketsToWallets.value && (ticket?.contact?.wallets?.length || 0) > 0) {
            const idx = ticket.contact.wallets.findIndex(w => w.id === userId)
            if (idx !== -1) {
                return true
            }
            return false
        }

        // Não visualizar tickets atribuídos a outros
        if (config.notViewAssignedTickets.value && ticket?.userId && ticket.userId !== userId) {
            return false
        }

        // Filtro de tickets não assinados
        if (filtros.isNotAssignedUser) {
            return !ticket.userId
        }

        // Filtro de tags
        if (filtros.tagsIds.length > 0) {
            const ticketTags = ticket.contact?.tags?.map(t => t.id) || []
            const hasMatchingTag = filtros.tagsIds.some(tagId => ticketTags.includes(tagId))
            if (!hasMatchingTag) {
                return false
            }
        }

        return true
    }

    /**
     * Filtra uma lista de tickets
     */
    const filterTickets = (tickets) => {
        return tickets.filter(checkTicketFilter)
    }

    return {
        filtros,
        hasFiltrosAtivos,
        carregarFiltros,
        salvarFiltros,
        limparFiltros,
        checkTicketFilter,
        filterTickets
    }
}
