import { format, formatDistance, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function useDateTools() {
    /**
     * Formata uma data para o padrão de exibição no chat (HH:mm)
     * @param {string|Date} date 
     */
    const formatarHora = (date) => {
        if (!date) return ''
        const d = typeof date === 'string' ? parseISO(date) : date
        if (!isValid(d)) return ''
        return format(d, 'HH:mm', { locale: ptBR })
    }

    /**
     * Formata uma data para o padrão DD/MM/YYYY
     * @param {string|Date} date 
     */
    const formatarData = (date) => {
        if (!date) return ''
        const d = typeof date === 'string' ? parseISO(date) : date
        if (!isValid(d)) return ''
        return format(d, 'dd/MM/yyyy', { locale: ptBR })
    }

    /**
     * Retorna a distância de tempo (ex: "há 2 minutos")
     * @param {string|Date} date 
     */
    const formatarDistancia = (date) => {
        if (!date) return ''
        const d = typeof date === 'string' ? parseISO(date) : date
        if (!isValid(d)) return ''
        return formatDistance(d, new Date(), { locale: ptBR, addSuffix: true })
    }

    /**
     * Formatação completa para logs e históricos
     * @param {string|Date} date 
     */
    const formatarDataHora = (date) => {
        if (!date) return ''
        const d = typeof date === 'string' ? parseISO(date) : date
        if (!isValid(d)) return ''
        return format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR })
    }

    return {
        formatarHora,
        formatarData,
        formatarDistancia,
        formatarDataHora
    }
}
