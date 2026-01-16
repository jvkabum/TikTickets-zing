import { defineStore } from 'pinia'
import {
  CriarAcaoEtapa,
  CriarAutoResposta,
  CriarEtapaResposta,
  DeletarAcaoEtapa,
  DeletarAutoResposta,
  DeletarEtapaResposta,
  EditarAcaoEtapa,
  EditarAutoResposta,
  EditarEtapaResposta,
  ListarAutoResposta
} from 'src/service/autoResposta'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

export const useAutoRespostaStore = defineStore('autoResposta', {
  state: () => ({
    autoRespostas: [],
    loading: false
  }),
  actions: {
    async listarAutoRespostas () {
      this.loading = true
      try {
        const { data } = await ListarAutoResposta()
        this.autoRespostas = data.autoReply
      } catch (error) {
        notificarErro('Erro ao listar Auto Respostas', error)
      } finally {
        this.loading = false
      }
    },
    async criarAutoResposta (autoResposta) {
      this.loading = true
      try {
        const { data } = await CriarAutoResposta(autoResposta)
        this.autoRespostas.push(data)
        notificarSucesso('Auto Resposta criada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao criar Auto Resposta', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async editarAutoResposta (autoResposta) {
      this.loading = true
      try {
        const { data } = await EditarAutoResposta(autoResposta)
        const index = this.autoRespostas.findIndex(a => a.id === data.id)
        if (index !== -1) {
          const oldData = this.autoRespostas[index]
          // Preserve expanded state or nested data if backend doesn't return everything?
          // Usually backend returns full object or we assume it replaces.
          // Assuming replacement is safe but if nested data is missing in return, we might need to merge.
          // For now, assuming data is complete or we rely on re-fetch if needed.
          // Better: merge steps if data.stepsReply is missing/empty but we had them?
          // Backend typically returns the updated entity.
          this.autoRespostas[index] = data
        }
        notificarSucesso('Auto Resposta editada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao editar Auto Resposta', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarAutoResposta (autoRespostaId) {
      this.loading = true
      try {
        await DeletarAutoResposta(autoRespostaId)
        this.autoRespostas = this.autoRespostas.filter(a => a.id !== autoRespostaId)
        notificarSucesso('Auto Resposta deletada com sucesso!')
      } catch (error) {
        notificarErro('Erro ao deletar Auto Resposta', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async criarEtapa (etapa) {
      this.loading = true
      try {
        const { data } = await CriarEtapaResposta(etapa)
        const autoReply = this.autoRespostas.find(a => a.id === data.idAutoReply)
        if (autoReply) {
          if (!autoReply.stepsReply) autoReply.stepsReply = []
          autoReply.stepsReply.push(data)
        }
        notificarSucesso('Etapa criada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao criar Etapa', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async editarEtapa (etapa) {
      this.loading = true
      try {
        const { data } = await EditarEtapaResposta(etapa)
        const autoReply = this.autoRespostas.find(a => a.id === data.idAutoReply)
        if (autoReply && autoReply.stepsReply) {
          const index = autoReply.stepsReply.findIndex(s => s.id === data.id)
          if (index !== -1) {
            autoReply.stepsReply[index] = data
          }
        }
        notificarSucesso('Etapa editada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao editar Etapa', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarEtapa (etapa) {
      this.loading = true
      try {
        await DeletarEtapaResposta(etapa)
        const autoReply = this.autoRespostas.find(a => a.id === etapa.idAutoReply)
        if (autoReply && autoReply.stepsReply) {
          autoReply.stepsReply = autoReply.stepsReply.filter(s => s.id !== etapa.id)
        }
        notificarSucesso('Etapa deletada com sucesso!')
      } catch (error) {
        notificarErro('Erro ao deletar Etapa', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async criarAcao (acao) {
      this.loading = true
      try {
        const { data } = await CriarAcaoEtapa(acao)
        // We need to find the step to add this action to
        // We might need to traverse autoRespostas to find the step with stepReplyId
        for (const ar of this.autoRespostas) {
          if (ar.stepsReply) {
            const step = ar.stepsReply.find(s => s.id === data.stepReplyId)
            if (step) {
              if (!step.stepsReplyAction) step.stepsReplyAction = []
              step.stepsReplyAction.push(data)
              break
            }
          }
        }
        notificarSucesso('Ação criada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao criar Ação', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async editarAcao (acao) {
      this.loading = true
      try {
        const { data } = await EditarAcaoEtapa(acao)
        for (const ar of this.autoRespostas) {
          if (ar.stepsReply) {
            const step = ar.stepsReply.find(s => s.id === data.stepReplyId)
            if (step && step.stepsReplyAction) {
              const index = step.stepsReplyAction.findIndex(a => a.id === data.id)
              if (index !== -1) {
                step.stepsReplyAction[index] = data
              }
              break
            }
          }
        }
        notificarSucesso('Ação editada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao editar Ação', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarAcao (acao) {
      this.loading = true
      try {
        await DeletarAcaoEtapa(acao)
        for (const ar of this.autoRespostas) {
          if (ar.stepsReply) {
            const step = ar.stepsReply.find(s => s.id === acao.stepReplyId)
            if (step && step.stepsReplyAction) {
              step.stepsReplyAction = step.stepsReplyAction.filter(a => a.id !== acao.id)
              break
            }
          }
        }
        notificarSucesso('Ação deletada com sucesso!')
      } catch (error) {
        notificarErro('Erro ao deletar Ação', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
