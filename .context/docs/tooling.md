---
type: doc
name: tooling
description: Guia completo de ferramentas, automação e produtividade para desenvolvedores TikTickets-zing
category: tooling
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Guia de Ferramentas e Produtividade

Este guia compila os fundamentos técnicos, ferramentas obrigatórias e automações projetadas para maximizar a eficiência e manter a qualidade do código em todo o ecossistema **TikTickets-zing**.

## Ferramentas Obrigatórias

Para garantir um ambiente consistente, instale as seguintes ferramentas:

*   **Node.js**:
    *   **Versão**: Backend exige `>=20`, Frontend exige `>=18.20.3`. Recomendamos o uso da v20 LTS para ambos.
    *   **Gerenciamento**: Utilize `nvm` ou `fnm` para trocar de versões facilmente.
*   **npm (Node Package Manager)**:
    *   **Versão**: `>=6.13.4` (Geralmente vem com o Node).
*   **TypeScript**:
    *   **Versão**: `^4.8.4` (Padronizado no backend).
*   **Quasar CLI (Frontend)**:
    *   Necessário para gerenciar e executar o frontend Vue 3.5.
    *   Instalação: `npm install -g @quasar/cli`
*   **PostgreSQL**: Base de dados relacional principal.
*   **Redis**: Essencial para o BullMQ (filas) e cache de sessões.
*   **PM2**: Gerenciador de processos para ambiente de produção (Frontend e Backend).
*   **Sequelize CLI**: Para gerir migrações e seeds de banco de dados.

## Automação e Scripts Recomendados

### Frontend (`frontend-vue-3`)
*   `npm run dev`: Inicia o servidor de desenvolvimento Quasar com hot-reload.
*   `npm run format`: Formata o código com Prettier e aplica `lint:fix`. **(Comando recomendado antes de commits)**.
*   `npm run test`: Executa testes unitários com Vitest.
*   `npm run test:coverage`: Gera relatório de cobertura de testes.
*   `npm run build`: Compila a aplicação para produção (PWA ou SPA).

### Backend (`backend`)
*   `npm run dev`: Inicia o servidor backend via `ts-node-dev` com auto-restart.
*   `npm run watch`: Compila TypeScript em tempo real.
*   `npm run test`: Executa suíte de testes Jest.
*   `npm run db:migrate`: Sincroniza o esquema do banco de dados.
*   `npm run db:seed`: Popula o banco com dados iniciais.

## Configuração do Editor (VS Code)

Para uma experiência premium e captura de erros em tempo real, instale estas extensões:

*   **ESLint** (`dbaeumer.vscode-eslint`): Feedback de padronização.
*   **Prettier** (`esbenp.prettier-vscode`): Formatação automática. *Dica: Ative "Format On Save".*
*   **Volar** (`Vue.volar`): Suporte essencial para Vue 3.5.
*   **TypeScript Vue Plugin** (`Vue.vscode-typescript-vue-plugin`).
*   **Docker** (`ms-azuretools.vscode-docker`): Gestão de containers (Postgres/Redis).
*   **Path IntelliSense**: Autocompletar caminhos de arquivos.

## Dicas de Alta Produtividade

*   **Docker Compose**: Use o arquivo `backend/docker-compose.yml` para subir Postgres e Redis sem instalações locais pesadas: `docker-compose up -d`.
*   **Aliases de Terminal**:
    ```bash
    alias fdev="cd frontend-vue-3 && npm run dev"
    alias bdev="cd backend && npm run dev"
    ```
*   **Inspeção de Redis**: Utilize ferramentas como **Redis Insight** para monitorar o estado das sessões do WhatsApp e as filas do BullMQ em tempo real.
*   **DBeaver**: Recomendado para gerenciar o PostgreSQL e auditar o isolamento por `tenantId`.

## Materiais de Apoio
- [development-workflow.md](./development-workflow.md)
- [getting-started.md](./getting-started.md)
