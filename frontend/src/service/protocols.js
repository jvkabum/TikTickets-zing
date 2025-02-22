import request from 'src/service/request'

export function ListarProtocolos (ticketId) {
  if (!ticketId) {
    throw new Error('ID do ticket é obrigatório')
  }
  return request({
    url: `/protocols/ticket/${ticketId}`,
    method: 'get'
  })
}

export function CriarProtocolo (data) {
  return request({
    url: '/protocols',
    method: 'post',
    data
  })
}

export function FecharProtocolo (protocolNumber) {
  return request({
    url: `/protocols/${protocolNumber}/close`,
    method: 'put'
  })
}
