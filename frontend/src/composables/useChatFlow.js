import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { CriarChatFlow, DeletarChatFlow, EditarChatFlow, ListarChatFlow } from 'src/service/chatFlow'

/**
 * Composable para gerenciar Chat Flows
 */
export function useChatFlow () {
    const $q = useQuasar()

    const chatFlows = ref([])
    const loading = ref(false)
    const chatFlowAtual = ref(null)

    /**
     * Lista todos os chat flows
     */
    const listarChatFlows = async () => {
        loading.value = true
        try {
            const { data } = await ListarChatFlow()
            chatFlows.value = data.chatFlows || data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar chat flows',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Cria um novo chat flow
     */
    const criarChatFlow = async (chatFlow) => {
        loading.value = true
        try {
            const { data } = await CriarChatFlow(chatFlow)
            chatFlows.value.unshift(data)
            $q.notify({
                type: 'positive',
                message: 'Chat Flow criado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao criar chat flow',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Edita um chat flow existente
     */
    const editarChatFlow = async (id, chatFlow) => {
        loading.value = true
        try {
            const { data } = await EditarChatFlow(id, chatFlow)
            const idx = chatFlows.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                chatFlows.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Chat Flow atualizado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao atualizar chat flow',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Deleta um chat flow
     */
    const deletarChatFlow = async (id) => {
        loading.value = true
        try {
            await DeletarChatFlow(id)
            chatFlows.value = chatFlows.value.filter(c => c.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Chat Flow deletado com sucesso',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar chat flow',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Seleciona um chat flow para edição
     */
    const selecionarChatFlow = (chatFlow) => {
        chatFlowAtual.value = { ...chatFlow }
    }

    /**
     * Limpa seleção
     */
    const limparSelecao = () => {
        chatFlowAtual.value = null
    }

    return {
        chatFlows,
        loading,
        chatFlowAtual,
        listarChatFlows,
        criarChatFlow,
        editarChatFlow,
        deletarChatFlow,
        selecionarChatFlow,
        limparSelecao
    }
}
