import { defineStore } from 'pinia'
import {
  AdicionarContatosCampanha,
  AlterarCampanha,
  CancelarCampanha,
  CriarCampanha,
  DeletarCampanha,
  DeletarContatoCampanha,
  DeletarTodosContatosCampanha,
  IniciarCampanha,
  ListarCampanhas,
  ListarContatosCampanha
} from 'src/service/campanhas'
import { notificarErro } from 'src/utils/helpersNotifications'

export const useCampanhaStore = defineStore('campanha', {
  state: () => ({
    campanhas: [],
    loading: false,
    filtros: {
      searchParam: '',
      status: null,
      pageNumber: 1
    }
  }),
  getters: {
    campanhasAtivas: (state) => state.campanhas.filter(c => c.status === 'processing'),
    campanhasAgendadas: (state) => state.campanhas.filter(c => c.status === 'scheduled'),
    getStatusLabel: () => (status) => {
      const labels = {
        pending: 'Pendente',
        scheduled: 'Agendada',
        processing: 'Em Andamento',
        finished: 'Finalizada',
        cancelled: 'Cancelada',
        failed: 'Falhou'
      }
      return labels[status] || status
    },
    getStatusColor: () => (status) => {
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
  },
  actions: {
    async listarCampanhas() {
      this.loading = true
      try {
        const { data } = await ListarCampanhas(this.filtros)
        this.campanhas = data.campanhas || data
        return data
      } catch (error) {
        notificarErro('Erro ao listar campanhas', error)
      } finally {
        this.loading = false
      }
    },
    async criarCampanha(campanha) {
      this.loading = true
      try {
        const { data } = await CriarCampanha(campanha)
        this.campanhas.push(data)
        return data
      } catch (error) {
        notificarErro('Erro ao criar campanha', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async alterarCampanha(campanha) {
      this.loading = true
      try {
        const id = campanha.id || campanha.get('id')
        const { data } = await AlterarCampanha(campanha, id)
        const index = this.campanhas.findIndex(c => c.id === data.id)
        if (index !== -1) {
          this.campanhas[index] = data
        }
        return data
      } catch (error) {
        notificarErro('Erro ao alterar campanha', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarCampanha(campanha) {
      this.loading = true
      try {
        await DeletarCampanha(campanha)
        if (Array.isArray(this.campanhas)) {
          this.campanhas = this.campanhas.filter(c => c.id !== campanha.id)
        }
      } catch (error) {
        notificarErro('Erro ao deletar campanha', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async cancelarCampanha(id) {
      try {
        await CancelarCampanha(id)
        // Atualização da lista será feita pelo socket ou recarregamento
      } catch (error) {
        notificarErro('Erro ao cancelar campanha', error)
        throw error
      }
    },
    async iniciarCampanha(id) {
      try {
        await IniciarCampanha(id)
        // Atualização da lista será feita pelo socket ou recarregamento
      } catch (error) {
        notificarErro('Erro ao iniciar campanha', error)
        throw error
      }
    },
    async adicionarContatosCampanha(contatos, campaignId) {
      try {
        const { data } = await AdicionarContatosCampanha(contatos, campaignId)
        return data
      } catch (error) {
        notificarErro('Erro ao adicionar contatos', error)
        throw error
      }
    },
    async listarContatosCampanha(campaignId) {
      try {
        const { data } = await ListarContatosCampanha(campaignId)
        return data
      } catch (error) {
        notificarErro('Erro ao listar contatos da campanha', error)
        throw error
      }
    },
    async deletarContatoCampanha(campaignId, contactId) {
      try {
        await DeletarContatoCampanha(campaignId, contactId)
      } catch (error) {
        notificarErro('Erro ao deletar contato da campanha', error)
        throw error
      }
    },
    async deletarTodosContatosCampanha(campaignId) {
      try {
        await DeletarTodosContatosCampanha(campaignId)
      } catch (error) {
        notificarErro('Erro ao deletar todos os contatos da campanha', error)
        throw error
      }
    },
    atualizarCampanha(campanha) {
      const index = this.campanhas.findIndex(c => c.id === campanha.id)
      if (index !== -1) {
        this.campanhas[index] = campanha
      } else {
        this.campanhas.unshift(campanha)
      }
    }
  }
})
