import { defineStore } from 'pinia'
import { AlterarEtiqueta, CriarEtiqueta, DeletarEtiqueta, ListarEtiquetas } from 'src/service/etiquetas'
import { notificarErro } from 'src/utils/helpersNotifications'

export const useEtiquetaStore = defineStore('etiquetas', {
  state: () => ({
    etiquetas: [],
    loading: false
  }),
  actions: {
    async listarEtiquetas () {
      this.loading = true
      try {
        const { data } = await ListarEtiquetas()
        this.etiquetas = data
      } catch (error) {
        notificarErro('Erro ao listar etiquetas', error)
      } finally {
        this.loading = false
      }
    },
    async criarEtiqueta (etiqueta) {
      try {
        const { data } = await CriarEtiqueta(etiqueta)
        this.etiquetas.push(data)
        return data
      } catch (error) {
        notificarErro('Erro ao criar etiqueta', error)
        throw error
      }
    },
    async alterarEtiqueta (etiqueta) {
      try {
        const { data } = await AlterarEtiqueta(etiqueta)
        const index = this.etiquetas.findIndex(e => e.id === data.id)
        if (index !== -1) {
          this.etiquetas[index] = data
        }
        return data
      } catch (error) {
        notificarErro('Erro ao alterar etiqueta', error)
        throw error
      }
    },
    async deletarEtiqueta (etiquetaAction) {
      try {
        await DeletarEtiqueta(etiquetaAction)
        this.etiquetas = this.etiquetas.filter(e => e.id !== etiquetaAction.id)
      } catch (error) {
        notificarErro('Erro ao deletar etiqueta', error)
        throw error
      }
    }
  }
})
