---
type: doc
name: getting-started
description: Guia inicial de setup de ambiente, dependências e execução do projeto
category: onboarding
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Início Rápido (Getting Started)

Este guia detalha os passos necessários para configurar e executar o projeto TikTickets-zing.

## Requisitos de Sistema
Certifique-se de que seu ambiente de desenvolvimento atende aos seguintes requisitos:

- **Node.js**: Versão 20.x ou superior.
- **PostgreSQL**: Necessário para a persistência de todos os dados da aplicação.
- **Redis**: Utilizado para gerenciar filas de tarefas (através da biblioteca `Bull`) e para o cache de sessões, otimizando o desempenho e a escalabilidade.

## Instalação e Execução

O projeto é modularizado em três diretórios principais: `backend`, `frontend-vue-3` e `frontend`. Para iniciar o ambiente de desenvolvimento completo, você precisará executar comandos em terminais separados para cada parte.

### 1. Backend

O diretório `backend` contém a API principal da aplicação.

```bash
# Navegue até o diretório do backend
cd backend

# Instale as dependências do projeto
npm install

# Configure as variáveis de ambiente:
# Crie um arquivo .env na raiz do diretório backend
# e preencha-o com as configurações necessárias,
# usando o .env.example como modelo.

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

### 2. Frontend Moderno (Foco Principal)

O diretório `frontend-vue-3` abriga a interface de usuário principal, desenvolvida com Vue 3.

```bash
# Navegue até o diretório do frontend moderno
cd frontend-vue-3

# Instale as dependências do projeto
npm install

# Inicie o servidor de desenvolvimento do frontend
npm run dev
```

### 3. Frontend Legado (Opcional)

O diretório `frontend` contém uma versão mais antiga da interface, que só deve ser iniciada se houver necessidade específica de trabalhar com essa parte do código.

```bash
# Navegue até o diretório do frontend legado
cd frontend

# Instale as dependências do projeto
npm install

# Inicie o servidor de desenvolvimento do frontend legado
npm run dev
```

## Configuração de Ambiente (`.env`)

É crucial configurar corretamente as variáveis de ambiente no arquivo `.env` localizado no diretório `backend`. Este arquivo deve ser baseado no `backend/.env.example`.

As seguintes variáveis são essenciais:

-   **Variáveis de Banco de Dados PostgreSQL:**
    -   `DB_DIALECT`: O dialeto do banco de dados (ex: `postgres`).
    -   `DB_HOST`: O host do servidor PostgreSQL.
    -   `DB_USER`: O nome de usuário para acesso ao PostgreSQL.
    -   `DB_PASS`: A senha para acesso ao PostgreSQL.
    -   `DB_NAME`: O nome do banco de dados.

-   **Variáveis de Conexão Redis:**
    -   `REDIS_HOST`: O host do servidor Redis.
    -   `REDIS_PORT`: A porta do servidor Redis.

-   **Segurança (JSON Web Tokens):**
    -   `JWT_SECRET`: Uma chave secreta para assinar tokens JWT.
    -   `JWT_REFRESH_SECRET`: Uma chave secreta para assinar tokens de refresh JWT.

-   **URLs da Aplicação:**
    -   `BACKEND_URL`: A URL base do seu servidor backend (ex: `http://localhost:3000`).
    -   `FRONTEND_URL`: A URL base do seu servidor frontend (ex: `http://localhost:8080` para o Vue 3 ou o frontend legado).
