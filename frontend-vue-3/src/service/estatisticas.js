import request from 'src/service/request'

export function ConsultarTicketsQueuesService(params, signal) {
  return request({
    url: '/dash-tickets-queues',
    method: 'get',
    params,
    signal
  })
}

export function RelatorioContatos(params, signal) {
  return request({
    url: '/contacts-report',
    method: 'get',
    params,
    signal
  })
}

export function RelatorioResumoAtendimentosUsuarios(params, signal) {
  return request({
    url: '/statistics-per-users',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsAndTimes(params, signal) {
  return request({
    url: '/statistics-tickets-times',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsChannels(params, signal) {
  return request({
    url: '/statistics-tickets-channels',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsEvolutionChannels(params, signal) {
  return request({
    url: '/statistics-tickets-evolution-channels',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsEvolutionByPeriod(params, signal) {
  return request({
    url: '/statistics-tickets-evolution-by-period',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsPerUsersDetail(params, signal) {
  return request({
    url: '/statistics-tickets-per-users-detail',
    method: 'get',
    params,
    signal
  })
}

export function GetDashTicketsQueue(params, signal) {
  return request({
    url: '/statistics-tickets-queue',
    method: 'get',
    params,
    signal
  })
}
