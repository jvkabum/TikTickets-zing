import { getBaseURL } from 'src/service/request'
import mitt from 'mitt' // Usaremos o mitt (embutido no vue 3 ou instalável) como barramento de eventos interno para emular a API do socket.io

// Helper para converter http:// para ws://
const getWsUrl = (baseUrl) => {
  if (!baseUrl) return ''
  return baseUrl.replace(/^http/, 'ws')
}

class NativeSocketIOEmulator {
  constructor() {
    this.ws = null
    this.url = ''
    this.emitter = mitt()
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.id = Math.random().toString(36).substring(7)
  }

  // Alias para compatibilidade com código legado que usa socket.connected (Socket.IO API)
  get connected () {
    return this.isConnected
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return

    // Se já calculou a URL base antes, reutiliza (evita perder o /api/v1 no reconnect)
    if (!this.wsBaseUrl) {
      const baseUrl = getBaseURL()
      if (!baseUrl) {
        console.error('socketIO (Native): VUE_URL_API não definida no .env. Conexão WebSocket abortada.')
        return
      }
      // Converte http -> ws e garante que termina com /api/v1/ws
      let wsUrl = baseUrl.replace(/^http/, 'ws')
      wsUrl = wsUrl.replace(/\/api\/v1\/?$/, '') // remove /api/v1 do final se vier
      wsUrl = wsUrl.replace(/\/$/, '')           // remove trailing slash
      this.wsBaseUrl = `${wsUrl}/api/v1/ws`      // sempre /api/v1/ws
    }

    const tokenItem = localStorage.getItem('token')
    const token = tokenItem ? JSON.parse(tokenItem) : null
    const wsUrl = token
      ? `${this.wsBaseUrl}?token=${encodeURIComponent(token)}`
      : this.wsBaseUrl

    console.info('socketIO (Native): Inicializando conexão com:', wsUrl)

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.info('socketIO (Native): Conectado com sucesso!', this.id)
      this.emitter.emit('connect')
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // O backend em Go envia: { type: 'evento:nome', payload: { ... } } ou { action: '...', data: ... }
        // Se seguir o modelo WsMessage do backend Go: Type e Payload
        if (data.type) {
          this.emitter.emit(data.type, data.payload)
        } else if (data.action) { // Fallback legado
          this.emitter.emit(data.action, data.data)
        } else {
          // Socket.io legado envia [evento, payload] (Array)
          if (Array.isArray(data) && data.length > 0) {
            this.emitter.emit(data[0], data[1])
          }
        }
      } catch (err) {
        console.error('socketIO (Native): Erro ao dar parse na mensagem', err, event.data)
      }
    }

    this.ws.onclose = (event) => {
      this.isConnected = false
      console.info('socketIO (Native): Desconectado. Motivo:', event.code, event.reason)
      this.emitter.emit('disconnect', event.reason)
      this.handleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('socketIO (Native): Erro na conexão', error)
      this.emitter.emit('error', error)
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.info(`socketIO (Native): Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts}) em 3 segundos...`)
      setTimeout(() => {
        this.connect()
      }, 3000)
    }
  }

  // API compatível com Socket.io-client
  on(event, callback) {
    this.emitter.on(event, callback)
  }

  off(event, callback) {
    this.emitter.off(event, callback)
  }

  removeAllListeners(event) {
    if (event) {
      this.emitter.all.delete(event)
    } else {
      this.emitter.all.clear()
    }
  }

  emit(event, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Formato esperado pelo WsMessage no Go
      const msg = JSON.stringify({ type: event, payload })
      this.ws.send(msg)
    } else {
      console.warn('socketIO (Native): Tentou emitir evento, mas não está conectado.', event)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

let socketInstance = null

export const socketIO = () => {
  if (socketInstance) return socketInstance

  socketInstance = new NativeSocketIOEmulator()
  // Emula a propriedade socket.io (usado internamente em alguns logs ou plugins)
  socketInstance.io = {
    on: (evt, cb) => socketInstance.on(evt, cb)
  }

  socketInstance.connect()

  return socketInstance
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

// NÃO conecta automaticamente ao importar o módulo.
// A conexão é iniciada explicitamente após o login via socketIO()
export default {
  connect: () => socketIO(),
  disconnect: () => disconnectSocket(),
  on: (event, cb) => socketIO().on(event, cb),
  off: (event, cb) => { if (socketInstance) socketInstance.off(event, cb) },
  emit: (event, payload) => { if (socketInstance) socketInstance.emit(event, payload) },
  get isConnected () { return socketInstance?.isConnected || false },
  get id () { return socketInstance?.id || null }
}
