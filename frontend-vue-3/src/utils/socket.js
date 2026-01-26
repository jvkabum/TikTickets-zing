import { io } from 'socket.io-client'
import { getBaseURL } from 'src/service/request'

let socketInstance = null

export const socketIO = () => {
  if (socketInstance) return socketInstance

  socketInstance = io(getBaseURL(), {
    reconnection: true,
    autoConnect: true,
    transports: ['websocket'], // Forcing websocket to match legacy behavior
    auth: cb => {
      const tokenItem = localStorage.getItem('token')
      const token = tokenItem ? JSON.parse(tokenItem) : null
      cb({ token })
    }
  })

  socketInstance.io.on('error', error => {
    console.error('socket error', error)
  })

  socketInstance.on('disconnect', reason => {
    console.info('socket disconnect', reason)
  })

  return socketInstance
}

const socket = socketIO()
export default socket
