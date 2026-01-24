
/**
 * Composable para gerenciar contatos (Binding para useContatoStore)
 */
export function useContatos () {
    const store = useContatoStore()
    const {
        contatos,
        loading,
        contatoAtual,
        hasMore,
        filtros,
        totalContatos
    } = storeToRefs(store)

    return {
        // Estado (reativo via store)
        contatos,
        loading,
        contatoAtual,
        hasMore,
        filtros,
        totalContatos,

        // Métodos (delegados para a store)
        listarContatos: store.listarContatos,
        buscarContato: store.obterContato,
        criarContato: store.criarContato,
        editarContato: store.editarContato,
        deletarContato: store.deletarContato,
        selecionarContato: store.selecionarContato,
        limparSelecao: store.limparSelecao,
        formatarNumero: store.formatarNumero,
        importarContatos: store.importarContatos,
        exportarContatos: store.exportarContatos
    }
}
