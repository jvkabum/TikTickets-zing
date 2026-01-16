import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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
    logout,
    updateUser
  }
})
