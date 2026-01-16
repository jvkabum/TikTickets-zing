import { describe, expect, it } from 'vitest'

describe('Setup de Testes', () => {
  it('deve somar 1 + 1 corretamente', () => {
    expect(1 + 1).toBe(2)
  })

  it('deve confirmar que o Vitest está rodando', () => {
    expect(true).toBe(true)
  })
})
