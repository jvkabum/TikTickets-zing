import { defineStore } from 'pinia'
import {
    RelatorioContatos,
    RelatorioResumoAtendimentosUsuarios,
    GetDashTicketsAndTimes,
    GetDashTicketsChannels,
    GetDashTicketsEvolutionChannels,
    GetDashTicketsEvolutionByPeriod,
    GetDashTicketsPerUsersDetail,
    GetDashTicketsQueue
} from 'src/service/estatisticas'

export const useRelatorioStore = defineStore('relatorios', {
    state: () => ({
        dadosResumo: [],
        ticketsQueue: [],
        ticketsChannels: [],
        ticketsEvolutionChannels: [],
        ticketsEvolutionByPeriod: [],
        ticketsPerUsersDetail: [],
        ticketsAndTimes: {
            qtd_total_atendimentos: 0,
            qtd_demanda_ativa: 0,
            qtd_demanda_receptiva: 0,
            new_contacts: 0,
            tma: {},
            tme: {}
        },
        loading: false
    }),
    actions: {
        async obterRelatorioResumoAtendimentosUsuarios (params) {
            this.loading = true
            try {
                const { data } = await RelatorioResumoAtendimentosUsuarios(params)
                this.dadosResumo = data
                return data
            } finally {
                this.loading = false
            }
        },
        async obterRelatorioContatos (params) {
            this.loading = true
            try {
                const { data } = await RelatorioContatos(params)
                return data
            } finally {
                this.loading = false
            }
        },
        async obterDashTicketsAndTimes (params) {
            try {
                const { data } = await GetDashTicketsAndTimes(params)
                this.ticketsAndTimes = data[0] || {}
                return this.ticketsAndTimes
            } catch (error) {
                console.error(error)
            }
        },
        async obterDashTicketsQueue (params) {
            try {
                const { data } = await GetDashTicketsQueue(params)
                this.ticketsQueue = data
                return data
            } catch (error) {
                console.error(error)
            }
        },
        async obterDashTicketsChannels (params) {
            try {
                const { data } = await GetDashTicketsChannels(params)
                this.ticketsChannels = data
                return data
            } catch (error) {
                console.error(error)
            }
        },
        async obterDashTicketsEvolutionChannels (params) {
            try {
                const { data } = await GetDashTicketsEvolutionChannels(params)
                this.ticketsEvolutionChannels = data
                return data
            } catch (error) {
                console.error(error)
            }
        },
        async obterDashTicketsEvolutionByPeriod (params) {
            try {
                const { data } = await GetDashTicketsEvolutionByPeriod(params)
                this.ticketsEvolutionByPeriod = data
                return data
            } catch (error) {
                console.error(error)
            }
        },
        async obterDashTicketsPerUsersDetail (params) {
            try {
                const { data } = await GetDashTicketsPerUsersDetail(params)
                this.ticketsPerUsersDetail = data
                return data
            } catch (error) {
                console.error(error)
            }
        }
    }
})
