import { defineStore } from 'pinia'
import { AdminListarEmpresas, AlterarTenant, CriarTenant, DeletarTenant } from 'src/service/empresas'

export const useTenantStore = defineStore('tenants', {
  state: () => ({
    tenants: []
  }),
  actions: {
    async listarTenants () {
      const { data } = await AdminListarEmpresas()
      this.tenants = data
      return data
    },
    async criarTenant (data) {
      const { data: res } = await CriarTenant(data)
      this.tenants.push(res)
      return res
    },
    async atualizarTenant (data) {
      const { data: res } = await AlterarTenant(data)
      const index = this.tenants.findIndex(t => t.id === data.id)
      if (index !== -1) {
        this.tenants[index] = res
      }
      return res
    },
    async deletarTenant (data) {
      await DeletarTenant(data)
      this.tenants = this.tenants.filter(t => t.id !== data.id)
    }
  }
})
