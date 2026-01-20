
/**
 * Composable para gerenciar campanhas (Binding para useCampanhaStore)
 */
export function useCampanhas() {
    const store = useCampanhaStore()
    const {
        campanhas,
        loading,
        filtros,
        campanhasAtivas,
        campanhasAgendadas
    } = storeToRefs(store)

    return {
        // Estado (reativo via store)
        campanhas,
        loading,
        filtros,

        // Getters
        campanhasAtivas,
        campanhasAgendadas,

        // Métodos (delegados para a store)
        listarCampanhas: store.listarCampanhas,
        criarCampanha: store.criarCampanha,
        editarCampanha: store.alterarCampanha, // Mapeado para o nome na store
        deletarCampanha: store.deletarCampanha,
        iniciarCampanha: store.iniciarCampanha,
        cancelarCampanha: store.cancelarCampanha,

        // Helpers de formatação (agora via store)
        getStatusLabel: store.getStatusLabel,
        getStatusColor: store.getStatusColor
    }
}
