import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'

/**
 * Composable para ler e interpretar configurações do sistema
 */
export function useConfiguracoes() {
    const storage = useLocalStorage()

    /**
     * Verifica se uma configuração está habilitada
     */
    const isEnabled = (key) => {
        const value = storage.getConfiguracao(key)
        return value === 'enabled' || value === true || value === '1'
    }

    /**
     * Não visualizar tickets ainda com o Chatbot
     */
    const notViewTicketsChatBot = computed(() => isEnabled('NotViewTicketsChatBot'))

    /**
     * Direcionar tickets para carteiras
     */
    const directTicketsToWallets = computed(() => isEnabled('DirectTicketsToWallets'))

    /**
     * Não visualizar tickets atribuídos a outros usuários
     */
    const notViewAssignedTickets = computed(() => isEnabled('NotViewAssignedTickets'))

    /**
     * Habilitar transferência entre filas
     */
    const enableQueueTransfer = computed(() => isEnabled('EnableQueueTransfer'))

    /**
     * Habilitar modo escuro por padrão
     */
    const darkModeDefault = computed(() => isEnabled('DarkModeDefault'))

    /**
     * Tempo limite para resposta automática (em segundos)
     */
    const autoReplyTimeout = computed(() => {
        const value = storage.getConfiguracao('AutoReplyTimeout', '300')
        return parseInt(value, 10)
    })

    /**
     * Mensagem de boas-vindas padrão
     */
    const welcomeMessage = computed(() => {
        return storage.getConfiguracao('WelcomeMessage', '')
    })

    /**
     * Mensagem de encerramento padrão
     */
    const closingMessage = computed(() => {
        return storage.getConfiguracao('ClosingMessage', '')
    })

    /**
     * Obtém qualquer configuração pelo key
     */
    const get = (key, defaultValue = null) => {
        return storage.getConfiguracao(key, defaultValue)
    }

    /**
     * Verifica se o sistema está em modo de manutenção
     */
    const isMaintenanceMode = computed(() => isEnabled('MaintenanceMode'))

    /**
     * Limite de mensagens por página
     */
    const messagesPerPage = computed(() => {
        const value = storage.getConfiguracao('MessagesPerPage', '20')
        return parseInt(value, 10)
    })

    /**
     * Habilitar notificações sonoras
     */
    const enableSoundNotifications = computed(() => {
        const value = storage.getConfiguracao('EnableSoundNotifications', 'enabled')
        return value === 'enabled'
    })

    return {
        // Computed Configs
        notViewTicketsChatBot,
        directTicketsToWallets,
        notViewAssignedTickets,
        enableQueueTransfer,
        darkModeDefault,
        autoReplyTimeout,
        welcomeMessage,
        closingMessage,
        isMaintenanceMode,
        messagesPerPage,
        enableSoundNotifications,
        // Methods
        get,
        isEnabled
    }
}
