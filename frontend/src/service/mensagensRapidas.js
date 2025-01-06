import request from 'src/service/request'

export function CriarMensagemRapida (data) {
  return request({
    url: '/fastreply/',
    method: 'post',
    data
  })
}

export function ListarMensagensRapidas () {
  return request({
    url: '/fastreply/',
    method: 'get'
  })
}

export function AlterarMensagemRapida (id, data) {
  return request({
    url: `/fastreply/${id}`,
    method: 'put',
    data
  })
}

export function DeletarMensagemRapida (data) {
  return request({
    url: `/fastreply/${data.id}`,
    method: 'delete'
  })
}

// Função para deletar uma imagem específica associada à mensagem rápida
export function DeletarImagemMensagemRapida (fastReplyId, mediaUrl) {
  return request({
    url: '/fastreply/delete-images',
    method: 'post',
    data: {
      fastReplyId,
      mediaUrl
    }
  })
}
