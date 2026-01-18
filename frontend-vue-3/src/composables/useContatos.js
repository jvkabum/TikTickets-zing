import { useQuasar } from 'quasar'
import {
    BuscarContato,
    CriarContato,
    DeletarContato,
    EditarContato,
    ListarContatos
} from 'src/service/contatos'
import { computed, reactive, ref } from 'vue'

/**
 * Composable para gerenciar contatos
 */
export function useContatos() {
    const $q = useQuasar()

    const contatos = ref([])
    const loading = ref(false)
    const contatoAtual = ref(null)
    const hasMore = ref(true)

    const filtros = reactive({
        searchParam: '',
        pageNumber: 1,
        tags: [],
        wallets: []
    })

    /**
     * Lista contatos com paginação
     */
    const listarContatos = async (resetar = false) => {
        if (resetar) {
            filtros.pageNumber = 1
            contatos.value = []
            hasMore.value = true
        }

        if (!hasMore.value) return

        loading.value = true
        try {
            const { data } = await ListarContatos(filtros)

            if (resetar || filtros.pageNumber === 1) {
                contatos.value = data.contacts || data
            } else {
                contatos.value = [...contatos.value, ...(data.contacts || data)]
            }

            hasMore.value = data.hasMore !== false
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar contatos',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Carrega mais contatos (paginação)
     */
    const carregarMais = async () => {
        if (!hasMore.value || loading.value) return
        filtros.pageNumber++
        await listarContatos()
    }

    /**
     * Busca um contato específico
     */
    const buscarContato = async (id) => {
        loading.value = true
        try {
            const { data } = await BuscarContato(id)
            contatoAtual.value = data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao buscar contato',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Cria um novo contato
     */
    const criarContato = async (contato) => {
        loading.value = true
        try {
            const { data } = await CriarContato(contato)
            contatos.value.unshift(data)
            $q.notify({
                type: 'positive',
                message: 'Contato criado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao criar contato',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Edita um contato existente
     */
    const editarContato = async (id, contato) => {
        loading.value = true
        try {
            const { data } = await EditarContato(id, contato)
            const idx = contatos.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                contatos.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Contato atualizado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao atualizar contato',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Deleta um contato
     */
    const deletarContato = async (id) => {
        loading.value = true
        try {
            await DeletarContato(id)
            contatos.value = contatos.value.filter(c => c.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Contato deletado com sucesso',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar contato',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Seleciona um contato para edição
     */
    const selecionarContato = (contato) => {
        contatoAtual.value = { ...contato }
    }

    /**
     * Limpa seleção
     */
    const limparSelecao = () => {
        contatoAtual.value = null
    }

    /**
     * Formata número de telefone para exibição
     */
    const formatarNumero = (numero) => {
        if (!numero) return ''
        // Remove o @c.us ou @s.whatsapp.net
        const limpo = numero.replace(/@.*$/, '')
        // Formata com máscara brasileira
        if (limpo.length === 13 && limpo.startsWith('55')) {
            return `+${limpo.slice(0, 2)} (${limpo.slice(2, 4)}) ${limpo.slice(4, 9)}-${limpo.slice(9)}`
        }
        return limpo
    }

    const totalContatos = computed(() => contatos.value.length)

    return {
        contatos,
        loading,
        contatoAtual,
        hasMore,
        filtros,
        totalContatos,
        listarContatos,
        carregarMais,
        buscarContato,
        criarContato,
        editarContato,
        deletarContato,
        selecionarContato,
        limparSelecao,
        formatarNumero
    }
}
