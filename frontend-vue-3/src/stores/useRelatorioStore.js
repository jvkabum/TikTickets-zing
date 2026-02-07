import { defineStore } from 'pinia'
import {
    GetDashTicketsAndTimes,
    GetDashTicketsChannels,
    GetDashTicketsEvolutionByPeriod,
    GetDashTicketsEvolutionChannels,
    GetDashTicketsPerUsersDetail,
    GetDashTicketsQueue,
    RelatorioContatos,
    RelatorioResumoAtendimentosUsuarios
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
        loading: false,
        abortController: null
    }),
    actions: {
        _getSignal() {
            // Se já houver um controlador, aproveita. Se não, cria um novo.
            // O reset deve ser manual via navegar ou novas chamadas se necessário.
            if (!this.abortController || this.abortController.signal.aborted) {
                this.abortController = new AbortController()
            }
            return this.abortController.signal
        },
        cancelarConsultas() {
            if (this.abortController) {
                this.abortController.abort()
                this.abortController = null
            }
            this.loading = false
        },
        async obterRelatorioResumoAtendimentosUsuarios(params) {
            this.loading = true
            try {
                const { data } = await RelatorioResumoAtendimentosUsuarios(params, this._getSignal())
                this.dadosResumo = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                throw error
            } finally {
                this.loading = false
            }
        },
        async obterRelatorioContatos(params) {
            this.loading = true
            try {
                const { data } = await RelatorioContatos(params, this._getSignal())
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                throw error
            } finally {
                this.loading = false
            }
        },
        async obterDashTicketsAndTimes(params) {
            try {
                const { data } = await GetDashTicketsAndTimes(params, this._getSignal())
                this.ticketsAndTimes = data[0] || {}
                return this.ticketsAndTimes
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        },
        async obterDashTicketsQueue(params) {
            try {
                const { data } = await GetDashTicketsQueue(params, this._getSignal())
                this.ticketsQueue = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        },
        async obterDashTicketsChannels(params) {
            try {
                const { data } = await GetDashTicketsChannels(params, this._getSignal())
                this.ticketsChannels = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        },
        async obterDashTicketsEvolutionChannels(params) {
            try {
                const { data } = await GetDashTicketsEvolutionChannels(params, this._getSignal())
                this.ticketsEvolutionChannels = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        },
        async obterDashTicketsEvolutionByPeriod(params) {
            try {
                const { data } = await GetDashTicketsEvolutionByPeriod(params, this._getSignal())
                this.ticketsEvolutionByPeriod = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        },
        async obterDashTicketsPerUsersDetail(params) {
            try {
                const { data } = await GetDashTicketsPerUsersDetail(params, this._getSignal())
                this.ticketsPerUsersDetail = data
                return data
            } catch (error) {
                if (!error) return
                if (error.name === 'CanceledError' || error.name === 'AbortError') return
                console.error(error)
            }
        }
    }
})
