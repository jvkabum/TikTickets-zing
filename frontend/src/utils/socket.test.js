import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('WebSocket', class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1 // OPEN
  }
  send(data) {}
  close() {}
})

import { socketIO } from './socket'

describe('NativeSocketIOEmulator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Limpar o cache do localstorage
    localStorage.clear()
  })

  it('deve inicializar o socketIO corretamente como Singleton', () => {
    const socket1 = socketIO()
    const socket2 = socketIO()
    
    expect(socket1).toBeDefined()
    expect(socket1).toBe(socket2) // Deve ser a mesma instância
  })

  it('deve ter os metodos on, off e emit', () => {
    const socket = socketIO()
    
    expect(typeof socket.on).toBe('function')
    expect(typeof socket.off).toBe('function')
    expect(typeof socket.emit).toBe('function')
  })

  it('deve registrar e emitir eventos via mitt', () => {
    const socket = socketIO()
    const mockCallback = vi.fn()
    
    socket.on('test_event', mockCallback)
    socket.emitter.emit('test_event', { data: 'test' })
    
    expect(mockCallback).toHaveBeenCalledWith({ data: 'test' })
  })
})
