import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuasar } from 'quasar'
import { reactive, ref } from 'vue'

/**
 * Composable para gerenciar relatórios e exportação
 */
export function useRelatorios() {
    const $q = useQuasar()

    const loading = ref(false)
    const dados = ref([])

    const filtros = reactive({
        dataInicio: format(new Date(), 'yyyy-MM-dd'),
        dataFim: format(new Date(), 'yyyy-MM-dd'),
        userId: null,
        queueId: null,
        status: null
    })

    /**
     * Formata data para exibição
     */
    const formatarData = (data, formato = 'dd/MM/yyyy') => {
        if (!data) return ''
        try {
            const date = typeof data === 'string' ? new Date(data) : data
            return format(date, formato, { locale: ptBR })
        } catch {
            return ''
        }
    }

    /**
     * Formata data e hora
     */
    const formatarDataHora = (data) => {
        return formatarData(data, 'dd/MM/yyyy HH:mm')
    }

    /**
     * Exporta dados para CSV
     */
    const exportarCSV = (dados, nomeArquivo, colunas) => {
        if (!dados || dados.length === 0) {
            $q.notify({
                type: 'warning',
                message: 'Não há dados para exportar',
                position: 'top'
            })
            return
        }

        const headers = colunas.map(c => c.label).join(';')
        const rows = dados.map(item =>
            colunas.map(c => {
                let valor = item[c.field]
                if (c.format) valor = c.format(valor)
                // Escapar valores com ponto e vírgula
                if (typeof valor === 'string' && valor.includes(';')) {
                    valor = `"${valor}"`
                }
                return valor ?? ''
            }).join(';')
        )

        const csv = [headers, ...rows].join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`
        link.click()

        URL.revokeObjectURL(url)

        $q.notify({
            type: 'positive',
            message: 'Relatório exportado com sucesso',
            position: 'top'
        })
    }

    /**
     * Exporta dados para JSON
     */
    const exportarJSON = (dados, nomeArquivo) => {
        if (!dados || dados.length === 0) {
            $q.notify({
                type: 'warning',
                message: 'Não há dados para exportar',
                position: 'top'
            })
            return
        }

        const json = JSON.stringify(dados, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`
        link.click()

        URL.revokeObjectURL(url)
    }

    /**
     * Calcula totais de uma coluna
     */
    const calcularTotal = (dados, campo) => {
        return dados.reduce((acc, item) => acc + (Number(item[campo]) || 0), 0)
    }

    /**
     * Calcula média de uma coluna
     */
    const calcularMedia = (dados, campo) => {
        if (!dados || dados.length === 0) return 0
        const total = calcularTotal(dados, campo)
        return total / dados.length
    }

    /**
     * Agrupa dados por um campo
     */
    const agruparPor = (dados, campo) => {
        return dados.reduce((grupos, item) => {
            const chave = item[campo] || 'Sem valor'
            if (!grupos[chave]) {
                grupos[chave] = []
            }
            grupos[chave].push(item)
            return grupos
        }, {})
    }

    /**
     * Ordena dados
     */
    const ordenar = (dados, campo, direcao = 'asc') => {
        return [...dados].sort((a, b) => {
            const valorA = a[campo]
            const valorB = b[campo]

            if (valorA === valorB) return 0

            const comparacao = valorA < valorB ? -1 : 1
            return direcao === 'asc' ? comparacao : -comparacao
        })
    }

    return {
        loading,
        dados,
        filtros,
        formatarData,
        formatarDataHora,
        exportarCSV,
        exportarJSON,
        calcularTotal,
        calcularMedia,
        agruparPor,
        ordenar
    }
}
