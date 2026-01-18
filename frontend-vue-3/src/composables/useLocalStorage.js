import { computed, ref } from 'vue'

/**
 * Composable para centralizar acesso ao localStorage com reatividade
 */
export function useLocalStorage() {
    // Cache reativo para evitar parsing repetido
    const cachedUsuario = ref(null)
    const cachedConfiguracoes = ref(null)
    const cachedQueues = ref(null)
    const cachedFiltros = ref(null)

    /**
     * Obtém o usuário logado
     */
    const getUsuario = () => {
        if (!cachedUsuario.value) {
            const data = localStorage.getItem('usuario')
            cachedUsuario.value = data ? JSON.parse(data) : null
        }
        return cachedUsuario.value
    }

    /**
     * Obtém o ID do usuário
     */
    const getUserId = () => {
        return +localStorage.getItem('userId') || getUsuario()?.userId || null
    }

    /**
     * Obtém o nome do usuário
     */
    const getUsername = () => {
        return localStorage.getItem('username') || getUsuario()?.name || ''
    }

    /**
     * Obtém o perfil do usuário (admin, user, super)
     */
    const getProfile = () => {
        return localStorage.getItem('profile') || 'user'
    }

    /**
     * Obtém o token de autenticação
     */
    const getToken = () => {
        return localStorage.getItem('token') || ''
    }

    /**
     * Obtém as configurações do sistema
     */
    const getConfiguracoes = () => {
        if (!cachedConfiguracoes.value) {
            const data = localStorage.getItem('configuracoes')
            cachedConfiguracoes.value = data ? JSON.parse(data) : []
        }
        return cachedConfiguracoes.value
    }

    /**
     * Obtém uma configuração específica pelo key
     */
    const getConfiguracao = (key, defaultValue = null) => {
        const configs = getConfiguracoes()
        const config = configs.find(c => c.key === key)
        return config?.value ?? defaultValue
    }

    /**
     * Obtém as filas do usuário
     */
    const getUserQueues = () => {
        if (!cachedQueues.value) {
            const data = localStorage.getItem('queues')
            cachedQueues.value = data ? JSON.parse(data) : []
        }
        return cachedQueues.value
    }

    /**
     * Obtém as filas cadastradas no tenant
     */
    const getFilasCadastradas = () => {
        const data = localStorage.getItem('filasCadastradas')
        return data ? JSON.parse(data) : []
    }

    /**
     * Obtém os filtros de atendimento salvos
     */
    const getFiltrosAtendimento = () => {
        if (!cachedFiltros.value) {
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
            }
            const data = localStorage.getItem('filtrosAtendimento')
            cachedFiltros.value = data ? JSON.parse(data) : filtroPadrao
        }
        return cachedFiltros.value
    }

    /**
     * Salva os filtros de atendimento
     */
    const setFiltrosAtendimento = (filtros) => {
        cachedFiltros.value = filtros
        localStorage.setItem('filtrosAtendimento', JSON.stringify(filtros))
    }

    /**
     * Limpa o cache (chamar após logout)
     */
    const clearCache = () => {
        cachedUsuario.value = null
        cachedConfiguracoes.value = null
        cachedQueues.value = null
        cachedFiltros.value = null
    }

    /**
     * Limpa todos os dados do localStorage (logout)
     */
    const clearAll = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('usuario')
        localStorage.removeItem('queues')
        localStorage.removeItem('configuracoes')
        localStorage.removeItem('filtrosAtendimento')
        clearCache()
    }

    // Computed properties para uso direto em templates
    const usuario = computed(() => getUsuario())
    const userId = computed(() => getUserId())
    const username = computed(() => getUsername())
    const profile = computed(() => getProfile())
    const isAdmin = computed(() => getProfile() === 'admin')
    const isSuper = computed(() => getProfile() === 'super')

    return {
        // Getters
        getUsuario,
        getUserId,
        getUsername,
        getProfile,
        getToken,
        getConfiguracoes,
        getConfiguracao,
        getUserQueues,
        getFilasCadastradas,
        getFiltrosAtendimento,
        // Setters
        setFiltrosAtendimento,
        clearCache,
        clearAll,
        // Computed
        usuario,
        userId,
        username,
        profile,
        isAdmin,
        isSuper
    }
}
