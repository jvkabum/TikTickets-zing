---
type: skill
name: Geração de Testes (Test Generation)
description: Diretrizes para criação de suítes de testes robustas no TikTickets-zing
skillSlug: test-generation
phases: [E, V]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 🧪 Geração de Testes (Test Generation)

Esta skill define o padrão de qualidade para testes automatizados no projeto, garantindo que novas funcionalidades não quebrem o core do sistema (WhatsApp e Multi-tenancy).

## 🎯 Escopo dos Testes

### 1. Backend (Jest/Supertest)
- **Testes de Integração**: Focar nos controllers e rotas protegidas (Auth Middleware).
- **Service Layer**: Validar lógica de negócio complexa isolada de I/O sempre que possível.
- **WhatsApp**: Simular eventos do `wwebjs` usando mocks para garantir que o sistema reage corretamente a mensagens, status e erros.

### 2. Frontend (Vitest/Cypress)
- **Componentes Quasar**: Testar interações de usuário (clicks, inputs) e renderização condicional por permissão.
- **Pinia Stores**: Validar o estado global e persistência de dados.

## 📝 Checklists de Implementação

### Requisitos Obrigatórios
- [ ] **Mocks Isolados**: Nunca usar conexões reais de WhatsApp ou bancos de produção durante os testes.
- [ ] **Limpeza de Estado**: Usar `beforeEach` e `afterEach` para resetar mocks e banco de dados (SQLite in-memory ou Postgres Cleanups).
- [ ] **Cobertura de Erros**: Testar não apenas o "caminho feliz", mas também timeouts, falhas de conexão e acessos não autorizados.

### Padrão de Nomenclatura
- Arquivos: `nomeArquivo.test.ts` ou `nomeArquivo.spec.ts`.
- Descrições: "Should [COMPORTAMENTO ESPERADO] when [CONDIÇÃO]".

## 🚀 Como Executar
```bash
# Backend
npm run test:backend

# Frontend
npm run test:frontend
```
