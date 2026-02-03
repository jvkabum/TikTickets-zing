import {
  AdminListarUsuarios,
  AdminUpdateUsuarios,
  CriarUsuario,
  CriarUsuarioTenant,
  DeleteUsuario,
  ListarUsuarios,
  UpdateUsuarios
} from 'src/service/user'

export const useUsuarioStore = defineStore('usuarios', {
  state: () => ({
    usuarios: [],
    usersApp: []
  }),
  actions: {
    // ... rest of actions
    async adminListarUsuarios(params) {
      try {
        const { data } = await AdminListarUsuarios(params)
        this.usuarios = data.users
        return data
      } catch (error) {
        throw error
      }
    },
    async adminAtualizarUsuario(userId, data) {
      try {
        const { data: res } = await AdminUpdateUsuarios(userId, data)
        const index = this.usuarios.findIndex(u => u.id === userId)
        if (index > -1) {
          this.usuarios.splice(index, 1, res)
        }
        return res
      } catch (error) {
        throw error
      }
    },
    async listarUsuarios(params) {
      try {
        const { data } = await ListarUsuarios(params)
        const usersFiltered = data.users.filter(u => u.profile !== 'super')
        this.usuarios = usersFiltered
        return { ...data, users: usersFiltered }
      } catch (error) {
        throw error
      }
    },
    async criarUsuario(data) {
      const { data: res } = await CriarUsuario(data)
      this.usuarios.push(res)
      return res
    },
    async criarUsuarioTenant(data) {
      const { data: res } = await CriarUsuarioTenant(data)
      this.usuarios.push(res)
      return res
    },
    async updateUsuarios(userId, data) {
      try {
        const { data: res } = await UpdateUsuarios(userId, data)
        const index = this.usuarios.findIndex(u => u.id === userId)
        if (index > -1) {
          this.usuarios.splice(index, 1, res)
        }
        return res
      } catch (error) {
        throw error
      }
    },
    async deleteUsuario(userId) {
      try {
        await DeleteUsuario(userId)
        const index = this.usuarios.findIndex(u => u.id === userId)
        if (index > -1) {
          this.usuarios.splice(index, 1)
        }
      } catch (error) {
        throw error
      }
    },
    setUsersApp(data) {
      this.usersApp = data
    }
  }
})
