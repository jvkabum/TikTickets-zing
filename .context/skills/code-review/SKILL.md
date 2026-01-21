# Habilidade: Revisão de Código (Code Review)

Diretrizes para garantir que o código do TikTickets-zing permaneça limpo, seguro e performático.

## Checklist de Revisão

### 1. Backend (TypeScript/Node.js)
- **Multi-Tenancy**: Toda busca no banco (`findAll`, `findOne`, etc) DEVE incluir o `tenantId`.
- **Tipagem**: Evitar o uso de `any`. Usar interfaces e tipos do Sequelize-typescript.
- **Async/Await**: Garantir o uso correto de `try-catch` em operações de I/O.
- **Wbot**: Novas implementações de WhatsApp devem usar o singleton de conexão em `libs/wbot.ts`.

### 2. Frontend (Vue 3.5 / Quasar)
- **Composition API**: Usar obrigatoriamente `<script setup>`.
- **Tanstack Query**: Substituir hooks de lifecycle (`onMounted`) por `useQuery` para buscar dados.
- **Reatividade**: Usar `ref` e `computed` de forma eficiente.
- **Estética**: Validar se o componente segue o padrão visual "premium" (gradientes, bordas arredondadas, micro-animações).

### 3. Padrões de Projeto
- **Commits**: Seguir a habilidade `commit-message`.
- **Logs**: Incluir `console.log` de performance em caminhos críticos de mensagens.

## O que Rejeitar
- Código no frontend legado (`/frontend`) que poderia ser implementado no moderno.
- Hardcoded URLs ou segredos (devem estar no `.env`).
- Queries SQL puras sem uma justificativa técnica forte (preferir Sequelize).
