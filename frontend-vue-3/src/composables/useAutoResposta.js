import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
    CriarAutoResposta,
    DeletarAutoResposta,
    EditarAutoResposta,
    ListarAutoRespostas
} from 'src/service/autoResposta'

/**
 * Composable para gerenciar fluxos de auto resposta
 */
export function useAutoResposta () {
    const $q = useQuasar()

    const autoRespostas = ref([])
    const loading = ref(false)
    const autoRespostaAtual = ref(null)
    const etapas = ref([])

    /**
     * Lista todas as auto respostas
     */
    const listarAutoRespostas = async () => {
        loading.value = true
        try {
            const { data } = await ListarAutoRespostas()
            autoRespostas.value = data.autoReplies || data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar fluxos',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Cria uma nova auto resposta
     */
    const criarAutoResposta = async (autoResposta) => {
        loading.value = true
        try {
            const { data } = await CriarAutoResposta(autoResposta)
            autoRespostas.value.unshift(data)
            $q.notify({
                type: 'positive',
                message: 'Fluxo criado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao criar fluxo',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Edita uma auto resposta existente
     */
    const editarAutoResposta = async (id, autoResposta) => {
        loading.value = true
        try {
            const { data } = await EditarAutoResposta(id, autoResposta)
            const idx = autoRespostas.value.findIndex(a => a.id === id)
            if (idx !== -1) {
                autoRespostas.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Fluxo atualizado com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao atualizar fluxo',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Deleta uma auto resposta
     */
    const deletarAutoResposta = async (id) => {
        loading.value = true
        try {
            await DeletarAutoResposta(id)
            autoRespostas.value = autoRespostas.value.filter(a => a.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Fluxo deletado com sucesso',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar fluxo',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Seleciona uma auto resposta para edição
     */
    const selecionarAutoResposta = (autoResposta) => {
        autoRespostaAtual.value = { ...autoResposta }
        etapas.value = autoResposta.steps || []
    }

    /**
     * Adiciona uma etapa ao fluxo
     */
    const adicionarEtapa = (etapa) => {
        etapas.value.push({
            id: Date.now(),
            ...etapa
        })
    }

    /**
     * Remove uma etapa do fluxo
     */
    const removerEtapa = (etapaId) => {
        etapas.value = etapas.value.filter(e => e.id !== etapaId)
    }

    /**
     * Reordena etapas
     */
    const reordenarEtapas = (novaOrdem) => {
        etapas.value = novaOrdem
    }

    /**
     * Limpa seleção
     */
    const limparSelecao = () => {
        autoRespostaAtual.value = null
        etapas.value = []
    }

    /**
     * Tipos de ação disponíveis
     */
    const tiposAcao = [
        { value: 'message', label: 'Enviar Mensagem' },
        { value: 'menu', label: 'Menu de Opções' },
        { value: 'transfer_queue', label: 'Transferir para Fila' },
        { value: 'transfer_user', label: 'Transferir para Usuário' },
        { value: 'close_ticket', label: 'Encerrar Atendimento' },
        { value: 'wait', label: 'Aguardar Resposta' }
    ]

    return {
        autoRespostas,
        loading,
        autoRespostaAtual,
        etapas,
        tiposAcao,
        listarAutoRespostas,
        criarAutoResposta,
        editarAutoResposta,
        deletarAutoResposta,
        selecionarAutoResposta,
        adicionarEtapa,
        removerEtapa,
        reordenarEtapas,
        limparSelecao
    }
}
