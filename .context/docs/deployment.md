# Guia de Deployment (Produção)

Instruções para realizar o deploy do TikTickets-zing v4 Enterprise.

## Requisitos de Servidor
- **Node.js**: >= 20.x
- **PostgreSQL**: >= 14
- **Redis**: Instalado e rodando (para Bull/Queue e Cache)
- **Dependências de Sistema**: Bibliotecas necessárias para o Chromium (Puppeteer) rodar em modo Headless no Linux.

## Fluxo de Deploy

### 1. Preparação do Ambiente
Crie o arquivo `.env` na raiz do backend baseado no `.env.example`.
- Defina `BACKEND_URL`, `FRONTEND_URL`, `JWT_SECRET`, e credenciais de banco/redis.

### 2. Backend
```bash
cd backend
npm install
npm run build
npx sequelize-cli db:migrate
pm2 start dist/server.js --name tiktickets-backend
```

### 3. Frontend (Vue 3 / Quasar)
```bash
cd frontend-vue-3
npm install
npm run build # Gera a pasta dist/spa
# Sirva a pasta dist/spa usando Nginx ou Apache
```

## Gestão de Processos (PM2)
O uso do PM2 é altamente recomendado para garantir que o backend reinicie automaticamente em caso de falha.
- Use `pm2 monit` para acompanhar o consumo de memória e CPU das sessões de WhatsApp.

## Backup
- **Banco de Dados**: Recomenda-se dump diário do PostgreSQL.
- **Sessões**: A pasta `backend/.wwebjs_auth` contém os logins do WhatsApp. Faça backup se planeja migrar de servidor.
