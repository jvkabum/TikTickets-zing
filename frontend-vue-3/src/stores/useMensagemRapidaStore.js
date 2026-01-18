import { defineStore } from 'pinia'
import {
  AlterarMensagemRapida,
  CriarMensagemRapida,
  DeletarImagemMensagemRapida,
  DeletarMensagemRapida,
  ListarMensagensRapidas
} from 'src/service/mensagensRapidas'
import { notificarErro } from 'src/utils/helpersNotifications'

export const useMensagemRapidaStore = defineStore('mensagemRapida', {
  state: () => ({
    mensagensRapidas: [],
    loading: false
  }),
  actions: {
    async listarMensagensRapidas () {
      this.loading = true
      try {
        const { data } = await ListarMensagensRapidas()
        this.mensagensRapidas = data
      } catch (error) {
        notificarErro('Erro ao listar mensagens rápidas', error)
      } finally {
        this.loading = false
      }
    },
    async criarMensagemRapida (mensagem) {
      this.loading = true
      try {
        const { data } = await CriarMensagemRapida(mensagem)
        this.mensagensRapidas.unshift(data)
        return data
      } catch (error) {
        notificarErro('Erro ao criar mensagem rápida', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async alterarMensagemRapida (id, mensagem) {
      this.loading = true
      try {
        const { data } = await AlterarMensagemRapida(id, mensagem)
        const index = this.mensagensRapidas.findIndex(m => m.id === id)
        if (index !== -1) {
          this.mensagensRapidas[index] = data
        }
        return data
      } catch (error) {
        notificarErro('Erro ao alterar mensagem rápida', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarMensagemRapida (mensagem) {
      this.loading = true
      try {
        await DeletarMensagemRapida(mensagem)
        this.mensagensRapidas = this.mensagensRapidas.filter(m => m.id !== mensagem.id)
      } catch (error) {
        notificarErro('Erro ao deletar mensagem rápida', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarImagemMensagemRapida (fastReplyId, mediaUrl) {
      try {
        await DeletarImagemMensagemRapida(fastReplyId, mediaUrl)
        // Atualizar o estado local se necessário, ou deixar que o refresh cuide disso,
        // mas idealmente atualizamos a lista localmente para evitar refetch
        const mensagem = this.mensagensRapidas.find(m => m.id === fastReplyId)
        if (mensagem && mensagem.medias) {
          mensagem.medias = mensagem.medias.filter(m => m !== mediaUrl)
        }
      } catch (error) {
        notificarErro('Erro ao deletar imagem', error)
        throw error
      }
    }
  }
})
