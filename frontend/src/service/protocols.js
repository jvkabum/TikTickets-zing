import request from 'src/service/request'

export function ListarProtocolos (ticketId) {
  if (!ticketId) {
    throw new Error('ID do ticket é obrigatório')
  }
  return request({
    url: `/protocols/ticket/${ticketId}`,
    method: 'get'
  }).then(response => {
    console.log('🔍 DEBUG - Resposta da API de protocolos:', {
      status: response.status,
      data: response.data?.map(p => ({
        id: p.id,
        protocolNumber: p.protocolNumber,
        userName: p.userName,
        status: p.status,
        createdAt: p.createdAt
      }))
    })
    return response
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
