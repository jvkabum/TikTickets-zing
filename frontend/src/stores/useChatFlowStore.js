import { defineStore } from 'pinia'
import { CriarChatFlow, DeletarChatFlow, ListarChatFlow, UpdateChatFlow } from 'src/service/chatFlow'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

export const useChatFlowStore = defineStore('chatFlow', {
  state: () => ({
    chatFlows: [],
    loading: false,
    // Builder state (migrated from Vuex)
    flow: {},
    usuarios: [],
    filas: []
  }),
  actions: {
    async listarChatFlows () {
      this.loading = true
      try {
        const { data } = await ListarChatFlow()
        this.chatFlows = data.chatFlow
      } catch (error) {
        notificarErro('Erro ao listar fluxos', error)
      } finally {
        this.loading = false
      }
    },
    async criarChatFlow (chatFlow) {
      this.loading = true
      try {
        const { data } = await CriarChatFlow(chatFlow)
        this.chatFlows.push(data)
        notificarSucesso('Fluxo criado com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao criar fluxo', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async atualizarChatFlow (chatFlow) {
      this.loading = true
      try {
        const { data } = await UpdateChatFlow(chatFlow)
        const index = this.chatFlows.findIndex(f => f.id === data.id)
        if (index !== -1) {
          this.chatFlows[index] = data
        }
        notificarSucesso('Fluxo atualizado com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao atualizar fluxo', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarChatFlow (chatFlow) {
      this.loading = true
      try {
        await DeletarChatFlow(chatFlow)
        this.chatFlows = this.chatFlows.filter(f => f.id !== chatFlow.id)
        notificarSucesso('Fluxo deletado com sucesso!')
      } catch (error) {
        notificarErro('Erro ao deletar fluxo', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    setFlowData (payload) {
      this.flow = payload.flow
      this.usuarios = payload.usuarios
      this.filas = payload.filas
    },
    resetFlowData () {
      this.flow = {}
      this.usuarios = []
      this.filas = []
    }
  }
})
