---
type: doc
name: testing-strategy
description: Frameworks de teste, padrões, requisitos de cobertura e portões de qualidade
category: testing
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Estratégia de Testes

Este documento detalha como a qualidade e a estabilidade do código são mantidas no **TikTickets-zing** através de uma suíte de testes automatizados e critérios de aceitação rigorosos.

## Estratégia de Testes

Nossa abordagem de testes foca na pirâmide de testes clássica, priorizando testes unitários para a lógica de negócio e testes de integração para validar o fluxo de dados entre os serviços e o banco de dados. Devido à natureza complexa das integrações com o WhatsApp (que exigem instâncias reais ou mocks pesados), os testes de integração são cruciais para garantir a resiliência do sistema.

## Tipos de Teste

Utilizamos os seguintes níveis de teste no projeto:

- **Testes Unitários**:
  - **Framework**: Jest (Backend) e Vitest (Frontend Vue 3).
  - **Convenção de Nomes**: Arquivos terminados em `*.spec.ts` ou `*.test.ts`.
  - **Foco**: Validação de helpers, utilitários, componentes isolados do Vue e lógica pura em serviços.

- **Testes de Integração**:
  - **Framework**: Jest com supertest para rotas de API.
  - **Cenários**: Fluxos completos de criação de tickets, validação de multi-tenancy e processamento de mensagens.
  - **Banco de Dados**: Utilizamos um banco de dados de teste isolado que é limpo/migrado a cada execução.

- **Testes de Interface (E2E)**:
  - **Framework**: Cypress ou Playwright (opcional para fluxos críticos).
  - **Cenários**: Login, abertura de ticket e envio de primeira mensagem.

## Executando Testes

Para rodar os testes localmente, utilize os seguintes comandos dentro da pasta `backend` ou `frontend-vue-3`:

### Backend
- **Todos os testes**: `npm run test`
- **Modo Watch**: `npm run test:watch`
- **Cobertura**: `npm run test:cov`

### Frontend (Vue 3)
- **Executar testes**: `npm run test:unit`
- **Cobertura**: `npm run test:unit:coverage`

## Portões de Qualidade (Quality Gates)

Antes de realizar o merge de novos recursos na branch `develop`, os seguintes critérios devem ser atendidos:

- **Linting**: O código deve passar em todas as regras do ESLint sem avisos ou erros. Comand: `npm run lint`.
- **Formatação**: O código deve seguir o padrão Prettier do projeto.
- **Cobertura Mínima**: Recomenda-se uma cobertura mínima de **70%** para novas funcionalidades na camada de serviço.
- **Sucesso na Build**: A aplicação deve compilar corretamente tanto no backend (`npm run build`) quanto no frontend.
- **Revisão de Pares**: Pelo menos uma aprovação de outro desenvolvedor ou agente especializado em arquitetura.

## Solução de Problemas

- **Testes Flaky**: Testes que dependem de sockets ou tempo de resposta do Puppeteer podem falhar intermitentemente em ambientes de CI lentos. Use timeouts generosos ou mocks determinísticos nestes casos.
- **Ambiente de Teste**: Certifique-se de que o Redis e o banco de dados de testes estão acessíveis antes de iniciar a suíte de testes de integração.

## Recursos Relacionados
- [development-workflow.md](./development-workflow.md)
- [tooling.md](./tooling.md)
