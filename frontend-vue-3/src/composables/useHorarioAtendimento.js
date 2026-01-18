import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'

/**
 * Composable para gerenciar horários de atendimento
 */
export function useHorarioAtendimento() {
    const $q = useQuasar()

    const horarios = ref([])
    const loading = ref(false)

    const diasSemana = [
        { value: 0, label: 'Domingo', short: 'Dom' },
        { value: 1, label: 'Segunda-feira', short: 'Seg' },
        { value: 2, label: 'Terça-feira', short: 'Ter' },
        { value: 3, label: 'Quarta-feira', short: 'Qua' },
        { value: 4, label: 'Quinta-feira', short: 'Qui' },
        { value: 5, label: 'Sexta-feira', short: 'Sex' },
        { value: 6, label: 'Sábado', short: 'Sáb' }
    ]

    /**
     * Cria horário padrão para todos os dias
     */
    const criarHorarioPadrao = () => {
        return diasSemana.map(dia => ({
            dayOfWeek: dia.value,
            dayLabel: dia.label,
            isOpen: dia.value >= 1 && dia.value <= 5, // Segunda a Sexta
            startTime: '08:00',
            endTime: '18:00',
            startLunchTime: '12:00',
            endLunchTime: '13:00',
            hasLunch: true
        }))
    }

    /**
     * Inicializa horários
     */
    const inicializarHorarios = (data = null) => {
        if (data && data.length > 0) {
            horarios.value = data
        } else {
            horarios.value = criarHorarioPadrao()
        }
    }

    /**
     * Atualiza horário de um dia específico
     */
    const atualizarHorario = (dayOfWeek, campo, valor) => {
        const idx = horarios.value.findIndex(h => h.dayOfWeek === dayOfWeek)
        if (idx !== -1) {
            horarios.value[idx][campo] = valor
        }
    }

    /**
     * Verifica se está em horário de atendimento
     */
    const estaEmHorarioAtendimento = () => {
        const agora = new Date()
        const diaSemana = agora.getDay()
        const horaAtual = agora.getHours() * 60 + agora.getMinutes()

        const horarioDia = horarios.value.find(h => h.dayOfWeek === diaSemana)
        if (!horarioDia || !horarioDia.isOpen) {
            return false
        }

        const [horaInicio, minInicio] = horarioDia.startTime.split(':').map(Number)
        const [horaFim, minFim] = horarioDia.endTime.split(':').map(Number)
        const inicioMinutos = horaInicio * 60 + minInicio
        const fimMinutos = horaFim * 60 + minFim

        // Verificar se está no horário de almoço
        if (horarioDia.hasLunch) {
            const [horaInicioAlmoco, minInicioAlmoco] = horarioDia.startLunchTime.split(':').map(Number)
            const [horaFimAlmoco, minFimAlmoco] = horarioDia.endLunchTime.split(':').map(Number)
            const inicioAlmoco = horaInicioAlmoco * 60 + minInicioAlmoco
            const fimAlmoco = horaFimAlmoco * 60 + minFimAlmoco

            if (horaAtual >= inicioAlmoco && horaAtual < fimAlmoco) {
                return false
            }
        }

        return horaAtual >= inicioMinutos && horaAtual < fimMinutos
    }

    /**
     * Obtém próximo horário de abertura
     */
    const getProximaAbertura = () => {
        const agora = new Date()
        let diaSemana = agora.getDay()

        for (let i = 0; i < 7; i++) {
            const dia = (diaSemana + i) % 7
            const horarioDia = horarios.value.find(h => h.dayOfWeek === dia)

            if (horarioDia && horarioDia.isOpen) {
                return {
                    dia: diasSemana.find(d => d.value === dia)?.label,
                    horario: horarioDia.startTime
                }
            }
        }
        return null
    }

    /**
     * Formata horário para exibição
     */
    const formatarPeriodo = (horario) => {
        if (!horario.isOpen) return 'Fechado'
        let periodo = `${horario.startTime} - ${horario.endTime}`
        if (horario.hasLunch) {
            periodo += ` (Almoço: ${horario.startLunchTime} - ${horario.endLunchTime})`
        }
        return periodo
    }

    const emAtendimento = computed(() => estaEmHorarioAtendimento())

    return {
        horarios,
        loading,
        diasSemana,
        emAtendimento,
        criarHorarioPadrao,
        inicializarHorarios,
        atualizarHorario,
        estaEmHorarioAtendimento,
        getProximaAbertura,
        formatarPeriodo
    }
}
