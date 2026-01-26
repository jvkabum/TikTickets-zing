import axios from 'axios'
import { Notify } from 'quasar'
import loading from 'src/utils/loading'
import { RouterInstance as Router } from '../router/index'
import backendErrors from './erros'
import { RefreshToken } from './login'

export const getBaseURL = () => {
  const envUrl = process.env.VUE_URL_API
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'http://localhost:8082') {
    console.info('getBaseURL: Usando VUE_URL_API da env:', envUrl)
    return envUrl
  }

  // Fallback dinâmico genérico:
  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location

    // Se estiver em localhost mas a env não foi setada corretamente
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8082'
    }

    const parts = hostname.split('.')
    if (parts.length > 2) {
      // Tenta substituir o primeiro prefixo por 'backend' ou 'api'
      // Ex: app.autotick.com.br -> backend.autotick.com.br
      const backendHostname = ['backend', ...parts.slice(1)].join('.')
      const url = `${protocol}//${backendHostname}`
      console.info('getBaseURL: Fallback dinâmico para subdomínio backend:', url)
      return url
    }

    // Se não tiver subdomínio, tenta usar a mesma URL mas na porta 8082 (fallback legacy)
    const fallbackUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`
    console.warn('getBaseURL: Nenhum padrão de subdomínio encontrado. Usando hostname atual como base:', fallbackUrl)
    return fallbackUrl
  }

  return 'http://localhost:8082'
}

const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 20000
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const handlerError = err => {
  const errorMsg = err?.response?.data?.error
  let error = 'Ocorreu um erro não identificado.'
  if (errorMsg) {
    if (backendErrors[errorMsg]) {
      error = backendErrors[errorMsg]
    } else {
      error = err.response.data.error
    }
  }
  Notify.create({
    position: 'top',
    type: 'negative',
    html: true,
    progress: true,
    message: `${JSON.stringify(error)}`
  })
}

const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  localStorage.removeItem('queues')
  localStorage.removeItem('filtrosAtendimento')
}

const redirectToLogin = () => {
  clearAuthData()
  if (Router.currentRoute.value.name !== 'login') {
    Router.push({ name: 'login' })
  }
}

const getValidToken = () => {
  try {
    const tokenAuth = localStorage.getItem('token')
    if (!tokenAuth) return null
    const token = JSON.parse(tokenAuth)
    return token || null
  } catch (e) {
    return null
  }
}

service.interceptors.request.use(
  config => {
    try {
      if (config.loading) {
        loading.show(config.loading)
      }

      // Não adiciona token para login e refresh
      if (config.url.includes('/auth/login') || config.url.includes('/auth/refresh_token')) {
        return config
      }

      const token = getValidToken()
      if (!token) {
        // Se não houver token e não for rota de login/refresh, redireciona para login
        if (!config.url.includes('/auth/login') && !config.url.includes('/auth/refresh_token')) {
          redirectToLogin()
          return Promise.reject(new Error('Token não encontrado'))
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    loading.hide(response.config)
    return response
  },
  async error => {
    loading.hide(error.config)

    const originalRequest = error.config
    const errorMessage = error?.response?.data?.error
    const status = error?.response?.status

    // Verifica erros específicos de sessão
    const sessionErrors = [
      'ERR_SESSION_EXPIRED',
      'Invalid token',
      'JWT must be provided',
      'Token was not provided',
      'Invalid token or not Admin'
    ]
    const isSessionError = sessionErrors.includes(errorMessage)

    if ((status === 403 || status === 401 || isSessionError) && !originalRequest.url.includes('/auth/login')) {
      // Se for erro no refresh token, vai direto para login
      if (originalRequest.url.includes('/auth/refresh_token')) {
        redirectToLogin()
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true

        try {
          const response = await RefreshToken()
          if (response?.data?.token) {
            const newToken = response.data.token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            processQueue(null, newToken)
            return service(originalRequest)
          } else {
            throw new Error('Refresh token falhou')
          }
        } catch (err) {
          processQueue(err, null)
          redirectToLogin()
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return service(originalRequest)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }

    if (error.response?.status === 500) {
      handlerError(error)
    } else if (error.message.indexOf('timeout') > -1) {
      Notify.create({
        message: 'Processando informações de estatísticas',
        position: 'top',
        type: 'positive',
        progress: true,
        html: true
      })
    } else {
      handlerError(error)
    }

    return Promise.reject(error.response)
  }
)

export default service
