import { defineStore } from 'pinia'
import { AlterarFila, CriarFila, DeletarFila, ListarFilas } from 'src/service/filas'
import { notificarErro } from 'src/utils/helpersNotifications'

export const useFilaStore = defineStore('fila', {
  state: () => ({
    filas: [],
    loading: false
  }),
  actions: {
    async listarFilas () {
      this.loading = true
      try {
        const { data } = await ListarFilas()
        this.filas = data
      } catch (error) {
        notificarErro('Erro ao listar filas', error)
      } finally {
        this.loading = false
      }
    },
    async criarFila (fila) {
      this.loading = true
      try {
        const { data } = await CriarFila(fila)
        this.filas.push(data)
        return data
      } catch (error) {
        notificarErro('Erro ao criar fila', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async alterarFila (fila) {
      this.loading = true
      try {
        const { data } = await AlterarFila(fila)
        const index = this.filas.findIndex(f => f.id === data.id)
        if (index !== -1) {
          this.filas[index] = data
        }
        return data
      } catch (error) {
        notificarErro('Erro ao alterar fila', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deletarFila (fila) {
      this.loading = true
      try {
        await DeletarFila(fila)
        this.filas = this.filas.filter(f => f.id !== fila.id)
      } catch (error) {
        notificarErro('Erro ao deletar fila', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
