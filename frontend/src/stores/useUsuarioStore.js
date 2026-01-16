import { defineStore } from 'pinia'
import {
  AdminListarUsuarios,
  AdminUpdateUsuarios,
  CriarUsuario,
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
    async listarUsuarios (params) {
      const { data } = await ListarUsuarios(params)
      this.usuarios = data.users
      return data
    },
    async adminListarUsuarios (params) {
      const { data } = await AdminListarUsuarios(params)
      this.usuarios = data.users
      return data
    },
    async criarUsuario (data) {
      const { data: res } = await CriarUsuario(data)
      this.usuarios.push(res)
      return res
    },
    async atualizarUsuario (userId, data) {
      const { data: res } = await UpdateUsuarios(userId, data)
      const index = this.usuarios.findIndex(u => u.id === userId)
      if (index !== -1) {
        this.usuarios[index] = res
      }
      return res
    },
    async adminAtualizarUsuario (userId, data) {
      const { data: res } = await AdminUpdateUsuarios(userId, data)
      const index = this.usuarios.findIndex(u => u.id === userId)
      if (index !== -1) {
        this.usuarios[index] = res
      }
      return res
    },
    async deletarUsuario (userId) {
      await DeleteUsuario(userId)
      this.usuarios = this.usuarios.filter(u => u.id !== userId)
    },
    setUsersApp (data) {
      this.usersApp = data
    }
  }
})
