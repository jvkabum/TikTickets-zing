import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfiguracaoStore } from 'src/stores/useConfiguracaoStore'

/**
 * Composable para ler e interpretar configurações do sistema
 */
export function useConfiguracoes () {
    const configuracaoStore = useConfiguracaoStore()
    const { settings } = storeToRefs(configuracaoStore)

    /**
     * Verifica se uma configuração está habilitada
     * @param {string} key
     * @returns {boolean}
     */
    const isEnabled = (key) => {
        const value = settings.value[key]
        return value === 'enabled' || value === 'true' || value === '1' || value === true
    }

    // Configurações comuns expostas como computed
    const notViewAssignedTickets = computed(() => isEnabled('NotViewAssignedTickets'))
    const notViewTicketsChatBot = computed(() => isEnabled('NotViewTicketsChatBot'))
    const directTicketsToWallets = computed(() => isEnabled('DirectTicketsToWallets'))
    const isGroupService = computed(() => isEnabled('isGroupService'))

    return {
        isEnabled,
        notViewAssignedTickets,
        notViewTicketsChatBot,
        directTicketsToWallets,
        isGroupService
    }
}
