import { format, subDays } from 'date-fns'
import {
    EstatisticasAtendimentos,
    EstatisticasTicketsPorCanal,
    EstatisticasTicketsPorFila,
    EstatisticasTicketsPorUsuario
} from 'src/service/estatisticas'
import { computed, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar dados do dashboard
 */
export function useDashboard () {
    const $q = useQuasar()

    const loading = ref(false)
    const estatisticas = ref({})
    const ticketsPorCanal = ref([])
    const ticketsPorFila = ref([])
    const ticketsPorUsuario = ref([])

    const periodo = reactive({
        dataInicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        dataFim: format(new Date(), 'yyyy-MM-dd')
    })

    /**
     * Carrega estatísticas gerais de atendimentos
     */
    const carregarEstatisticas = async () => {
        loading.value = true
        try {
            const params = {
                dateStart: periodo.dataInicio,
                dateEnd: periodo.dataFim
            }
            const { data } = await EstatisticasAtendimentos(params)
            estatisticas.value = data
            return data
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: 'Erro ao carregar estatísticas',
                position: 'top'
            })
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Carrega estatísticas por canal
     */
    const carregarTicketsPorCanal = async () => {
        try {
            const params = {
                dateStart: periodo.dataInicio,
                dateEnd: periodo.dataFim
            }
            const { data } = await EstatisticasTicketsPorCanal(params)
            ticketsPorCanal.value = data
            return data
        } catch (error) {
            console.error('Erro ao carregar tickets por canal', error)
            throw error
        }
    }

    /**
     * Carrega estatísticas por fila
     */
    const carregarTicketsPorFila = async () => {
        try {
            const params = {
                dateStart: periodo.dataInicio,
                dateEnd: periodo.dataFim
            }
            const { data } = await EstatisticasTicketsPorFila(params)
            ticketsPorFila.value = data
            return data
        } catch (error) {
            console.error('Erro ao carregar tickets por fila', error)
            throw error
        }
    }

    /**
     * Carrega estatísticas por usuário
     */
    const carregarTicketsPorUsuario = async () => {
        try {
            const params = {
                dateStart: periodo.dataInicio,
                dateEnd: periodo.dataFim
            }
            const { data } = await EstatisticasTicketsPorUsuario(params)
            ticketsPorUsuario.value = data
            return data
        } catch (error) {
            console.error('Erro ao carregar tickets por usuário', error)
            throw error
        }
    }

    /**
     * Carrega todos os dados do dashboard
     */
    const carregarTudo = async () => {
        loading.value = true
        try {
            await Promise.all([
                carregarEstatisticas(),
                carregarTicketsPorCanal(),
                carregarTicketsPorFila(),
                carregarTicketsPorUsuario()
            ])
        } finally {
            loading.value = false
        }
    }

    /**
     * Define período de filtro
     */
    const definirPeriodo = (dias) => {
        periodo.dataFim = format(new Date(), 'yyyy-MM-dd')
        periodo.dataInicio = format(subDays(new Date(), dias), 'yyyy-MM-dd')
        carregarTudo()
    }

    /**
     * Formata número para exibição
     */
    const formatarNumero = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num?.toString() || '0'
    }

    /**
     * Formata tempo médio (segundos para formato legível)
     */
    const formatarTempoMedio = (segundos) => {
        if (!segundos) return '0m'
        const horas = Math.floor(segundos / 3600)
        const minutos = Math.floor((segundos % 3600) / 60)
        if (horas > 0) {
            return `${horas}h ${minutos}m`
        }
        return `${minutos}m`
    }

    // Computed para estatísticas resumidas
    const totalTicketsAbertos = computed(() => estatisticas.value?.ticketsAbertos || 0)
    const totalTicketsPendentes = computed(() => estatisticas.value?.ticketsPendentes || 0)
    const totalTicketsFechados = computed(() => estatisticas.value?.ticketsFechados || 0)
    const tempoMedioResposta = computed(() => estatisticas.value?.tempoMedioResposta || 0)

    return {
        loading,
        estatisticas,
        ticketsPorCanal,
        ticketsPorFila,
        ticketsPorUsuario,
        periodo,
        totalTicketsAbertos,
        totalTicketsPendentes,
        totalTicketsFechados,
        tempoMedioResposta,
        carregarEstatisticas,
        carregarTicketsPorCanal,
        carregarTicketsPorFila,
        carregarTicketsPorUsuario,
        carregarTudo,
        definirPeriodo,
        formatarNumero,
        formatarTempoMedio
    }
}
