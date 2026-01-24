import request from 'src/service/request'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('usuario')) || null)
  const token = ref(JSON.parse(localStorage.getItem('token')) || null)
  const profile = ref(localStorage.getItem('profile') || 'user')

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => profile.value === 'admin')
  const userId = computed(() => user.value?.id || localStorage.getItem('userId'))

  function login (userData, userToken) {
    user.value = userData
    token.value = userToken
    profile.value = userData.profile || 'user'
    localStorage.setItem('usuario', JSON.stringify(userData))
    localStorage.setItem('token', JSON.stringify(userToken))
    localStorage.setItem('profile', userData.profile || 'user')
    localStorage.setItem('userId', userData.id)
  }

  function logout () {
    user.value = null
    token.value = null
    profile.value = 'user'
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
    localStorage.removeItem('userId')
  }

  async function handleLogin ({ email, password }) {
    const { router } = this || {} // O router estará disponível na instância se injetado via plugin
    try {
      const { data } = await request({
        url: '/auth/login',
        method: 'post',
        data: { email, password }
      })
      const userData = {
        name: data.username,
        email: data.email,
        profile: data.profile,
        status: data.status,
        id: data.userId,
        tenantId: data.tenantId,
        queues: data.queues
      }
      login(userData, data.token)

      // Persistir filtros e tema
      const pesquisaTicketsFiltroPadrao = {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending', 'closed'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
      }

      localStorage.setItem('filtrosAtendimento', JSON.stringify(data?.configs?.filtrosAtendimento || pesquisaTicketsFiltroPadrao))

      if (data?.configs?.isDark) {
        Dark.set(data.configs.isDark)
      }

      // Redirecionamento baseado no perfil
      if (data.profile === 'admin') {
        this.router.push({ name: 'home-dashboard' })
      } else if (data.profile === 'super') {
        this.router.push({ name: 'empresassuper' })
      } else {
        this.router.push({ name: 'atendimento' })
      }
    } catch (error) {
      throw error
    }
  }

  function updateUser (userData) {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('usuario', JSON.stringify(user.value))
  }

  return {
    user,
    token,
    profile,
    isAuthenticated,
    isAdmin,
    userId,
    login,
    handleLogin,
    logout,
    updateUser
  }
})
