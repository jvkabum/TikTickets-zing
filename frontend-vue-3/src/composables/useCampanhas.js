import { useQuasar } from 'quasar'
import {
    CancelarCampanha,
    CriarCampanha,
    DeletarCampanha,
    EditarCampanha,
    IniciarCampanha,
    ListarCampanhas
} from 'src/service/campanhas'
import { computed, reactive, ref } from 'vue'

/**
 * Composable para gerenciar campanhas
 */
export function useCampanhas() {
    const $q = useQuasar()

    const campanhas = ref([])
    const loading = ref(false)
    const campanhaAtual = ref(null)

    const filtros = reactive({
        searchParam: '',
        status: null,
        pageNumber: 1
    })

    /**
     * Lista todas as campanhas
     */
    const listarCampanhas = async () => {
        loading.value = true
        try {
            const { data } = await ListarCampanhas(filtros)
            campanhas.value = data.campanhas || data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao listar campanhas',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Cria uma nova campanha
     */
    const criarCampanha = async (campanha) => {
        loading.value = true
        try {
            const { data } = await CriarCampanha(campanha)
            campanhas.value.unshift(data)
            $q.notify({
                type: 'positive',
                message: 'Campanha criada com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao criar campanha',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Edita uma campanha existente
     */
    const editarCampanha = async (id, campanha) => {
        loading.value = true
        try {
            const { data } = await EditarCampanha(id, campanha)
            const idx = campanhas.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                campanhas.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Campanha atualizada com sucesso',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao atualizar campanha',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Deleta uma campanha
     */
    const deletarCampanha = async (id) => {
        loading.value = true
        try {
            await DeletarCampanha(id)
            campanhas.value = campanhas.value.filter(c => c.id !== id)
            $q.notify({
                type: 'positive',
                message: 'Campanha deletada com sucesso',
                position: 'top'
            })
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao deletar campanha',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Inicia uma campanha
     */
    const iniciarCampanha = async (id) => {
        try {
            const { data } = await IniciarCampanha(id)
            const idx = campanhas.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                campanhas.value[idx] = data
            }
            $q.notify({
                type: 'positive',
                message: 'Campanha iniciada',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao iniciar campanha',
                position: 'top'
            })
            throw error
        }
    }

    /**
     * Cancela uma campanha
     */
    const cancelarCampanha = async (id) => {
        try {
            const { data } = await CancelarCampanha(id)
            const idx = campanhas.value.findIndex(c => c.id === id)
            if (idx !== -1) {
                campanhas.value[idx] = data
            }
            $q.notify({
                type: 'warning',
                message: 'Campanha cancelada',
                position: 'top'
            })
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao cancelar campanha',
                position: 'top'
            })
            throw error
        }
    }

    /**
     * Obtém o status formatado
     */
    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendente',
            scheduled: 'Agendada',
            processing: 'Em Andamento',
            finished: 'Finalizada',
            cancelled: 'Cancelada',
            failed: 'Falhou'
        }
        return labels[status] || status
    }

    /**
     * Obtém a cor do status
     */
    const getStatusColor = (status) => {
        const colors = {
            pending: 'grey',
            scheduled: 'blue',
            processing: 'orange',
            finished: 'green',
            cancelled: 'red',
            failed: 'negative'
        }
        return colors[status] || 'grey'
    }

    const campanhasAtivas = computed(() =>
        campanhas.value.filter(c => c.status === 'processing')
    )

    const campanhasAgendadas = computed(() =>
        campanhas.value.filter(c => c.status === 'scheduled')
    )

    return {
        campanhas,
        loading,
        campanhaAtual,
        filtros,
        campanhasAtivas,
        campanhasAgendadas,
        listarCampanhas,
        criarCampanha,
        editarCampanha,
        deletarCampanha,
        iniciarCampanha,
        cancelarCampanha,
        getStatusLabel,
        getStatusColor
    }
}
