# Guia de Deploy Automático: VPS Ubuntu & Coolify

Este guia fornece duas opções para colocar o **TikTickets-zing** em produção na sua VPS Ubuntu:
1. **Opção 1 (100% Automática via Terminal)**: Executa um script bash que instala o Coolify, aloca SWAP, configura firewall, banco PostgreSQL, compila o Backend Go e o Frontend Vue 3 direto da branch `state`.
2. **Opção 2 (Configuração via Interface do Coolify)**: Para configurar exatamente as telas mostradas no seu painel (`frontend izing` e `backend izing`).

---

## ⚡ Opção 1: Instalação Automática via Terminal da VPS

Acesse sua VPS Ubuntu via SSH como `root` e execute o comando de uma linha:

```bash
curl -fsSL https://raw.githubusercontent.com/jvkabum/TikTickets-zing/state/deploy/install-coolify-tiktickets.sh | bash
```

### O que o script faz automaticamente:
- ✅ Cria **4GB de Swap** para evitar erros de falta de memória (OOM) durante o build do Vite.
- ✅ Atualiza o Ubuntu e instala dependências (`curl`, `git`, `jq`, `ufw`, etc.).
- ✅ Configura o **Firewall (UFW)** liberando as portas 22, 80, 443, 8000, 3000 e 8080.
- ✅ Instala a versão mais recente do **Coolify**.
- ✅ Sobe um container **PostgreSQL 17** com volume persistente.
- ✅ Compila e inicia o **Backend Go** conectado ao banco.
- ✅ Compila e inicia o **Frontend Vue 3 / Nginx** apontando para a API.
- ✅ Salva todas as senhas e chaves geradas em `/root/tiktickets-credenciais.txt`.

---

## 🖥️ Opção 2: Configuração na Interface do Coolify

Se você já instalou o Coolify e está com as telas abertas no navegador (como nas fotos enviadas):

### 1. Criar o Banco de Dados (PostgreSQL)
No Coolify:
1. Clique em **+ New Resource** -> **PostgreSQL**.
2. Defina:
   - **Database Name**: `tiktickets`
   - **User**: `postgres`
   - **Password**: defina uma senha segura.
3. Clique em **Deploy**.
4. Anote o nome do serviço interno do PostgreSQL (geralmente `postgresql` ou o IP/porta interna).

---

### 2. Configurar o `backend izing` (Backend Go)
Na tela da sua imagem (`production / backend izing`):
1. **General**:
   - **Repository**: `jvkabum/TikTickets-zing`
   - **Branch**: `state`
   - **Build Pack**: Selecione **Dockerfile**.
   - **Base Directory**: `/backend`
   - **Dockerfile Location**: `/backend/Dockerfile` (ou `/Dockerfile` se o Base Directory for `/backend`).
   - **Ports Exposes**: `3000`
2. **Environment Variables**:
   Adicione as seguintes variáveis na aba **Environment Variables**:
   ```env
   PORT=3000
   NODE_ENV=production
   TZ=America/Sao_Paulo
   BACKEND_URL=https://api.seudominio.com
   FRONTEND_URL=https://app.seudominio.com
   DB_HOST=postgresql
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=sua_senha_do_postgres
   DB_NAME=tiktickets
   JWT_SECRET=gere_uma_chave_longa_aqui_ex_32_caracteres
   JWT_REFRESH_SECRET=gere_outra_chave_longa_aqui
   ```
3. Clique em **Save** e depois em **Deploy**.

---

### 3. Configurar o `frontend izing` (Frontend Vue 3)
Na tela da sua imagem (`production / frontend izing`):
1. **General**:
   - **Repository**: `jvkabum/TikTickets-zing`
   - **Branch**: `state`
   - **Build Pack**: Selecione **Dockerfile**.
   - **Base Directory**: `/frontend`
   - **Dockerfile Location**: `/frontend/Dockerfile` (ou `/Dockerfile` se o Base Directory for `/frontend`).
   - **Ports Exposes**: `80`
2. **Environment Variables & Build Arguments**:
   Adicione na aba **Environment Variables** (marcando a opção *Is Build Variable* / *Build Argument*):
   ```env
   VUE_URL_API=https://api.seudominio.com
   ```
3. Clique em **Save** e depois em **Deploy**.
