import { defineStore } from 'pinia'
import { AlterarConfiguracao, ListarConfiguracoes } from 'src/service/configuracoes'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

export const useConfiguracaoStore = defineStore('configuracao', {
  state: () => ({
    configuracoes: [],
    settings: {
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      rejectCalls: null,
      callRejectMessage: '',
      daysToClose: 3
    },
    loading: false
  }),
  actions: {
    async listarConfiguracoes () {
      this.loading = true
      try {
        const { data } = await ListarConfiguracoes()
        this.configuracoes = data
        data.forEach(el => {
          let value = el.value
          if (el.key === 'botTicketActive' && el.value) {
            value = +el.value
          }
          if (Object.hasOwn(this.settings, el.key)) {
            this.settings[el.key] = value
          }
        })
      } catch (error) {
        notificarErro('Erro ao listar configurações', error)
      } finally {
        this.loading = false
      }
    },
    async atualizarConfiguracao (key, value) {
      this.loading = true
      const newValue = (value !== undefined && value !== null) ? value : this.settings[key]
      const params = {
        key,
        value: newValue
      }
      try {
        await AlterarConfiguracao(params)
        this.settings[key] = newValue
        notificarSucesso('Configuração alterada com sucesso!')
      } catch (error) {
        console.error('Erro ao alterar configuração:', error)
        if (error && error.response && error.response.data) {
          notificarErro('Erro ao alterar configuração', error.response.data.message)
        } else {
          notificarErro('Erro desconhecido', 'Ocorreu um erro ao tentar alterar a configuração')
        }
      } finally {
        this.loading = false
      }
    }
  }
})
