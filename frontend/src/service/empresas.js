import request from 'src/service/request'

export function MostrarHorariosAtendiemento () {
  return request({
    url: '/tenants/business-hours/',
    method: 'get'
  })
}

export function AtualizarHorariosAtendiemento (data) {
  return request({
    url: '/tenants/business-hours/',
    method: 'put',
    data
  })
}

export function AtualizarMensagemHorariosAtendiemento (data) {
  return request({
    url: '/tenants/message-business-hours/',
    method: 'put',
    data
  })
}

export function AdminListarEmpresas () {
  return request({
    url: '/admin/tenants/',
    method: 'get'
  })
}

export function CriarTenant (data) {
  return request({
    url: '/admin/tenants/',
    method: 'post',
    data
  })
}

export function AlterarTenant (data) {
  return request({
    url: `/admin/tenantsUpdate/${data.id}`,
    method: 'put',
    data
  })
}

export function ListarTenants () {
  return request({
    url: '/admin/tenants/',
    method: 'get'
  })
}

export function DeletarTenant (data) {
  return request({
    url: `/admin/tenants/${data.id}`,
    method: 'delete'
  })
}
