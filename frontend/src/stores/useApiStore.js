import { defineStore } from 'pinia'
import { ApagarAPI, CriarAPI, EditarAPI, ListarAPIs, NovoTokenAPI } from 'src/service/apiConfig'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

export const useApiStore = defineStore('api', {
  state: () => ({
    apis: [],
    loading: false
  }),
  actions: {
    async listarAPIs () {
      this.loading = true
      try {
        const { data } = await ListarAPIs()
        this.apis = data.apis
      } catch (error) {
        notificarErro('Erro ao listar APIs', error)
      } finally {
        this.loading = false
      }
    },
    async criarAPI (api) {
      this.loading = true
      try {
        const { data } = await CriarAPI(api)
        this.apis.push(data)
        notificarSucesso('API criada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao criar API', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async editarAPI (api) {
      this.loading = true
      try {
        const { data } = await EditarAPI(api)
        const index = this.apis.findIndex(a => a.id === api.id)
        if (index !== -1) {
          this.apis[index] = data
        }
        notificarSucesso('API editada com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao editar API', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async novoTokenAPI (api) {
      this.loading = true
      try {
        const { data } = await NovoTokenAPI(api)
        const index = this.apis.findIndex(a => a.id === api.id)
        if (index !== -1) {
          this.apis[index] = data
        }
        notificarSucesso('Token atualizado com sucesso!')
        return data
      } catch (error) {
        notificarErro('Erro ao gerar novo token', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async apagarAPI (api) {
      this.loading = true
      try {
        await ApagarAPI(api)
        this.apis = this.apis.filter(a => a.id !== api.id)
        notificarSucesso('API deletada com sucesso!')
      } catch (error) {
        notificarErro('Erro ao deletar API', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
