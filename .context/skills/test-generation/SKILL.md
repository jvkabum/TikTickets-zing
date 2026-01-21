# Habilidade: Geração de Testes (Test Generation)

Diretrizes para criação de testes automatizados no backend e frontend.

## Stack de Testes
- **Backend**: Jest + Supertest (para rotas de API).
- **Frontend**: Vitest + Vue Test Utils.

## O que Testar
1. **Lógica de Negócio**: Services de criação de ticket, transferência e encerramento.
2. **Multi-Tenancy**: Garantir que um tenant não consiga ver dados de outro através de testes de integração.
3. **Componentes (Vue 3)**: Validar renderização e emissão de eventos em componentes críticos de chat.

## Convenções
- Arquivos de teste devem terminar em `.spec.ts` ou `.test.ts`.
- Mockar o `whatsapp-web.js` usando a biblioteca de mock do Jest para evitar disparos reais durante os testes.

## Exemplo de Mock (Backend)
```typescript
jest.mock('./libs/wbot', () => ({
  getWbot: jest.fn().mockReturnValue({
    sendMessage: jest.fn().mockResolvedValue({ id: '123' })
  })
}));
```
