import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'

/**
 * Composable para gerenciar permissões e perfis de usuário
 */
export function usePermissoes() {
    const storage = useLocalStorage()

    /**
     * Verifica se o usuário é administrador
     */
    const isAdmin = computed(() => storage.getProfile() === 'admin')

    /**
     * Verifica se o usuário é super admin
     */
    const isSuper = computed(() => storage.getProfile() === 'super')

    /**
     * Verifica se o usuário é um usuário comum
     */
    const isUser = computed(() => storage.getProfile() === 'user')

    /**
     * Verifica se o usuário pode visualizar todos os tickets
     */
    const canViewAllTickets = computed(() => {
        const filtros = storage.getFiltrosAtendimento()
        return isAdmin.value && filtros.showAll
    })

    /**
     * Verifica se o usuário tem acesso a uma fila específica
     */
    const hasQueueAccess = (queueId) => {
        if (!queueId) return true
        const userQueues = storage.getUserQueues()
        return userQueues.some(q => q.id === queueId)
    }

    /**
     * Verifica se o usuário tem permissão para uma ação específica
     */
    const hasPermission = (permission) => {
        const usuario = storage.getUsuario()
        if (!usuario) return false

        // Super admin tem todas as permissões
        if (isSuper.value) return true

        // Verificar permissões específicas se existirem
        const permissions = usuario.permissions || []
        return permissions.includes(permission)
    }

    /**
     * Obtém as filas às quais o usuário tem acesso
     */
    const userQueues = computed(() => storage.getUserQueues())

    /**
     * Verifica se existem filas cadastradas no tenant
     */
    const hasQueuesInTenant = computed(() => {
        const filas = storage.getFilasCadastradas()
        return filas.length > 0
    })

    /**
     * Obtém o ID do usuário atual
     */
    const currentUserId = computed(() => storage.getUserId())

    /**
     * Verifica se um ticket pertence ao usuário atual
     */
    const isTicketOwner = (ticket) => {
        return ticket?.userId === currentUserId.value
    }

    /**
     * Verifica se o usuário pode acessar um ticket específico
     */
    const canAccessTicket = (ticket) => {
        // Admin com showAll pode ver tudo
        if (canViewAllTickets.value) return true

        // Grupos são visíveis para todos
        if (ticket?.isGroup) return true

        // Tickets do próprio usuário
        if (isTicketOwner(ticket)) return true

        // Verificar acesso à fila
        if (ticket?.queueId && !hasQueueAccess(ticket.queueId)) return false

        return true
    }

    return {
        // Computed
        isAdmin,
        isSuper,
        isUser,
        canViewAllTickets,
        userQueues,
        hasQueuesInTenant,
        currentUserId,
        // Methods
        hasQueueAccess,
        hasPermission,
        isTicketOwner,
        canAccessTicket
    }
}
