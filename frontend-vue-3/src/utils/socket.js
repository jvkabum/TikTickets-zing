import { io } from 'socket.io-client'

let socketInstance = null

export const socketIO = () => {
  if (socketInstance) return socketInstance

  socketInstance = io(process.env.VUE_URL_API, {
    reconnection: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: cb => {
      const tokenItem = localStorage.getItem('token')
      const token = tokenItem ? JSON.parse(tokenItem) : null
      // eslint-disable-next-line n/no-callback-literal
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
