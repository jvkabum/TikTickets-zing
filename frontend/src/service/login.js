import request from 'src/service/request'

export function RealizarLogin (user) {
  return request({
    url: '/auth/login/',
    method: 'post',
    data: user
  }).then(response => {
    if (response.data && response.data.token) {
      console.log('Token armazenado após login:', response.data.token)
      localStorage.setItem('token', JSON.stringify(response.data.token))
    }
    return response
  })
}
export function RealizarLogout (user) {
  return request({
    url: '/auth/logout/',
    method: 'post',
    data: user
  })
}

export function RefreshToken () {
  return request({
    url: '/auth/refresh_token',
    method: 'post'
  })
}
