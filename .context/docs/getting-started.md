# Início Rápido (Getting Started)

## Requisitos de Sistema
- **Node.js**: >= 20.x
- **PostgreSQL**: Para persistência de dados.
- **Redis**: Para gestão de filas (Bull) e cache de sessões.

## Instalação
O projeto é dividido em três diretórios principais. Execute os comandos em terminais separados:

### 1. Backend
```bash
cd backend
npm install
# Configure seu arquivo .env baseado no .env.example
npm run dev
```

### 2. Frontend Moderno (Foco)
```bash
cd frontend-vue-3
npm install
npm run dev
```

### 3. Frontend Legado (Apenas se necessário)
```bash
cd frontend
npm install
npm run dev
```

## Configuração de Ambiente (.env)
Certifique-se de configurar as seguintes variáveis no `backend/.env`:
- `DB_DIALECT`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `BACKEND_URL`, `FRONTEND_URL`
