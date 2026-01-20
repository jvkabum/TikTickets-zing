import { computed } from 'vue'

/**
 * Composable para ler e interpretar configurações do sistema
 */
export function useConfiguracoes() {
    const storage = useAppLocalStorage()

    /**
     * Verifica se uma configuração está habilitada
     */
    const isEnabled = (key) => {
        const value = storage.getConfiguracao(key)
        return value === 'enabled' || value === 'true' || value === '1' || value === true
    }

    // Configurações comuns expostas como computed
    const notViewAssignedTickets = computed(() => isEnabled('notViewAssignedTickets'))
    const notViewTicketsChatBot = computed(() => isEnabled('notViewTicketsChatBot'))
    const directTicketsToWallets = computed(() => isEnabled('directTicketsToWallets'))
    const isGroupService = computed(() => isEnabled('isGroupService'))

    return {
        isEnabled,
        notViewAssignedTickets,
        notViewTicketsChatBot,
        directTicketsToWallets,
        isGroupService
    }
}
