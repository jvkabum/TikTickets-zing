
/**
 * Composable para relatórios (Binding para useRelatorioStore)
 */
export function useRelatorios() {
    const store = useRelatorioStore()
    const {
        dadosResumo,
        ticketsQueue,
        ticketsChannels,
        ticketsEvolutionChannels,
        ticketsEvolutionByPeriod,
        ticketsPerUsersDetail,
        ticketsAndTimes,
        loading
    } = storeToRefs(store)

    return {
        // Estado
        dadosResumo,
        ticketsQueue,
        ticketsChannels,
        ticketsEvolutionChannels,
        ticketsEvolutionByPeriod,
        ticketsPerUsersDetail,
        ticketsAndTimes,
        loading,

        // Métodos
        obterRelatorioResumoAtendimentosUsuarios: store.obterRelatorioResumoAtendimentosUsuarios,
        obterRelatorioContatos: store.obterRelatorioContatos,
        obterDashTicketsAndTimes: store.obterDashTicketsAndTimes,
        obterDashTicketsQueue: store.obterDashTicketsQueue,
        obterDashTicketsChannels: store.obterDashTicketsChannels,
        obterDashTicketsEvolutionChannels: store.obterDashTicketsEvolutionChannels,
        obterDashTicketsEvolutionByPeriod: store.obterDashTicketsEvolutionByPeriod,
        obterDashTicketsPerUsersDetail: store.obterDashTicketsPerUsersDetail,
        cancelarConsultas: store.cancelarConsultas
    }
}
