import { io } from 'socket.io-client'
import { getBaseURL } from 'src/service/request'

let socketInstance = null

export const socketIO = () => {
  if (socketInstance) return socketInstance

  const url = getBaseURL()
  console.info('socketIO: Inicializando conexão com:', url)

  socketInstance = io(url, {
    reconnection: true,
    autoConnect: true,
    transports: ['websocket', 'polling'], // Fallback para polling se websocket falhar
    auth: cb => {
      const tokenItem = localStorage.getItem('token')
      const token = tokenItem ? JSON.parse(tokenItem) : null
      cb({ token })
    }
  })

  socketInstance.on('connect', () => {
    console.info('socketIO: Conectado com sucesso!', socketInstance.id)
  })

  socketInstance.io.on('error', error => {
    console.error('socketIO: Erro na conexão (manager):', error)
  })

  socketInstance.on('connect_error', error => {
    console.error('socketIO: Erro na conexão (socket):', error)
  })

  socketInstance.on('disconnect', reason => {
    console.info('socketIO: Desconectado. Motivo:', reason)
  })

  return socketInstance
}

const socket = socketIO()
export default socket
