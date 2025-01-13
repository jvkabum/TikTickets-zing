import request from 'src/service/request'
import { Notify } from 'quasar'

const handleAuthError = (error) => {
  const message = error?.response?.data?.error || 'Erro de autenticação'
  Notify.create({
    type: 'negative',
    message,
    position: 'top'
  })
  throw error
}

const setTokens = (token, refreshToken) => {
  if (!token) throw new Error('Token não recebido do servidor')
  localStorage.setItem('token', JSON.stringify(token))
  if (refreshToken) {
    localStorage.setItem('refreshToken', JSON.stringify(refreshToken))
  }
}

export function RealizarLogin (user) {
  return request({
    url: '/auth/login/',
    method: 'post',
    data: user
  }).then(response => {
    if (response.data?.token) {
      setTokens(response.data.token, response.data.refreshToken)
      return response
    }
    throw new Error('Token não recebido do servidor')
  }).catch(handleAuthError)
}

export function RealizarLogout (user) {
  const clearData = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
    localStorage.removeItem('profile')
    localStorage.removeItem('userId')
    localStorage.removeItem('usuario')
    localStorage.removeItem('queues')
    localStorage.removeItem('filtrosAtendimento')
  }

  return request({
    url: '/auth/logout/',
    method: 'post',
    data: user
  })
    .finally(clearData)
    .catch(handleAuthError)
}

export function RefreshToken () {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    return Promise.reject(new Error('Refresh token não disponível'))
  }

  try {
    const parsedRefreshToken = JSON.parse(refreshToken)
    if (!parsedRefreshToken) {
      throw new Error('Refresh token inválido')
    }

    return request({
      url: '/auth/refresh_token',
      method: 'post',
      data: {
        refreshToken: parsedRefreshToken
      }
    })
      .then(response => {
        if (response.data?.newToken) {
          setTokens(response.data.newToken, response.data.refreshToken)
          return {
            data: {
              token: response.data.newToken,
              refreshToken: response.data.refreshToken
            }
          }
        }
        throw new Error('Novo token não recebido durante refresh')
      })
      .catch(handleAuthError)
  } catch (error) {
    return Promise.reject(new Error('Erro ao processar refresh token'))
  }
}
