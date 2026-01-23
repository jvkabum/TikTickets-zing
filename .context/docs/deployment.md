---
type: doc
name: deployment
description: Procedimentos de produção, requisitos de servidor, PM2 e estratégias de backup
category: operations
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Guia de Deployment (Produção) do TikTickets-zing v4 Enterprise

Este guia detalha o processo de deployment da aplicação TikTickets-zing v4 Enterprise em um ambiente de produção. Ele abrange desde os requisitos do servidor até a gestão de processos e estratégias de backup, garantindo uma implantação robusta e confiável.

## Requisitos de Servidor

Para um funcionamento ideal do TikTickets-zing, o servidor de produção deve atender aos seguintes requisitos:

*   **Node.js**: Versão 20.x ou superior. É a plataforma de runtime para o backend da aplicação.
*   **PostgreSQL**: Versão 14 ou superior. Servidor de banco de dados relacional utilizado para armazenar todas as informações da aplicação.
*   **Redis**: Deve estar instalado e em execução. O Redis é utilizado para gerenciamento de filas (Bull/Queue) e caching, otimizando o desempenho e a resiliência da aplicação.
*   **Dependências de Sistema para Chromium (Puppeteer)**: Para ambientes Linux, são necessárias bibliotecas específicas que permitem o Chromium rodar em modo headless. Essas dependências são cruciais para funcionalidades que dependem do Puppeteer, como a automação de WhatsApp Web. Exemplos de pacotes comuns incluem `libatk-bridge2.0-0`, `libgbm-dev`, `libasound2`, `libnss3`, `libxss1`, `libcups2`, `libxrandr2`, `libappindicator3-1`, `libvulkan1` entre outros, dependendo da distribuição Linux.

## Fluxo de Deployment Detalhado

O processo de deployment é dividido em três etapas principais: preparação do ambiente, configuração e execução do backend, e configuração e serviço do frontend.

### 1. Preparação do Ambiente

Antes de iniciar o deployment do backend e frontend, é fundamental configurar corretamente o ambiente.

1.  **Criação do arquivo `.env`**: Na raiz do diretório `backend`, crie um arquivo `.env` baseado no modelo fornecido em `.env.example`. Este arquivo conterá as variáveis de ambiente sensíveis e de configuração da aplicação.

    Exemplo de variáveis essenciais a serem definidas:

    *   `NODE_ENV=production`: Define o ambiente como produção.
    *   `PORT=3000`: Porta na qual o servidor backend irá escutar.
    *   `BACKEND_URL=https://api.seusistema.com`: URL pública do backend. Essencial para a comunicação com o frontend e callbacks.
    *   `FRONTEND_URL=https://seusistema.com`: URL pública do frontend. Usado para referências em e-mails e outras comunicações.
    *   `JWT_SECRET=sua_chave_secreta_jwt`: Uma string complexa e única para assinar os tokens JWT. **Mantenha-a secreta e segura.**
    *   `DATABASE_URL=postgresql://user:password@host:port/database`: Credenciais completas para conexão com o PostgreSQL.
    *   `REDIS_URL=redis://:password@host:port`: URL de conexão com o servidor Redis.
    *   `CHROME_PATH=/usr/bin/google-chrome`: (Opcional, mas recomendado) Caminho completo para o executável do Chrome/Chromium no servidor, se não estiver no PATH padrão.
    *   `WWEBJS_PATH=./.wwebjs_auth`: Caminho para a pasta de sessões do WhatsApp Web.

    Certifique-se de que todas as credenciais e URLs estejam corretas para o ambiente de produção.

### 2. Backend

O backend do TikTickets-zing é construído com Node.js. Siga os passos abaixo para prepará-lo e iniciá-lo:

1.  **Navegar para o diretório do backend**:
    ```bash
    cd backend
    ```
2.  **Instalar dependências**: Instale todas as dependências do Node.js necessárias.
    ```bash
    npm install
    ```
3.  **Compilar a aplicação**: Compile o código TypeScript (ou equivalente) para JavaScript executável. Isso geralmente gera a pasta `dist/`.
    ```bash
    npm run build
    ```
4.  **Executar migrações do banco de dados**: Aplique todas as migrações pendentes ao banco de dados PostgreSQL.
    ```bash
    npx sequelize-cli db:migrate
    ```
    Isso garante que o esquema do banco de dados esteja atualizado com a versão mais recente da aplicação.
5.  **Iniciar o backend com PM2**: Utilize o PM2 (Process Manager 2) para gerenciar o processo do backend. O PM2 garante que a aplicação seja executada em segundo plano, reinicie automaticamente em caso de falha e otimize o uso de recursos.
    ```bash
    pm2 start dist/server.js --name tiktickets-backend
    ```
    Isto iniciará o servidor Node.js e o registrará no PM2 com o nome `tiktickets-backend`.

### 3. Frontend (Vue 3 / Quasar)

O frontend é uma aplicação Vue 3 desenvolvida com Quasar, que gera uma SPA (Single Page Application).

1.  **Navegar para o diretório do frontend**:
    ```bash
    cd frontend-vue-3
    ```
2.  **Instalar dependências**: Instale todas as dependências do Node.js necessárias para o frontend.
    ```bash
    npm install
    ```
3.  **Compilar a aplicação**: Compile a aplicação frontend para produção. Isso irá gerar uma pasta `dist/spa` contendo todos os arquivos estáticos prontos para serem servidos.
    ```bash
    npm run build
    ```
4.  **Servir a pasta `dist/spa`**: A pasta `dist/spa` deve ser servida por um servidor web como Nginx ou Apache.

    **Exemplo de Configuração Nginx:**
    Crie um arquivo de configuração para o seu domínio (ex: `/etc/nginx/sites-available/seusistema.com`):

    ```nginx
    server {
        listen 80;
        server_name seusistema.com www.seusistema.com;

        location / {
            root /caminho/para/frontend-vue-3/dist/spa; # Ajuste este caminho
            try_files $uri $uri/ /index.html;
        }

        # Opcional: Redirecionar todas as chamadas API para o backend
        location /api/ {
            proxy_pass http://localhost:3000/; # Ajuste a porta se necessário
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Após criar o arquivo, crie um link simbólico para `sites-enabled` e reinicie o Nginx.

## Gestão de Processos (PM2)

O PM2 é uma ferramenta essencial para gerenciar processos Node.js em produção. Ele oferece funcionalidades como:

*   **Manutenção de processos**: Garante que o backend reinicie automaticamente em caso de falha, aumentando a disponibilidade.
*   **Monitoramento**: Permite monitorar o consumo de CPU, memória, I/O e logs em tempo real.
*   **Clusterização**: Pode ser configurado para rodar múltiplas instâncias da aplicação, aproveitando múltiplos núcleos da CPU e melhorando a escalabilidade.

**Comandos úteis do PM2:**

*   `pm2 list`: Lista todos os processos gerenciados pelo PM2.
*   `pm2 monit`: Abre um dashboard de monitoramento em tempo real para acompanhar o consumo de memória e CPU, especialmente útil para sessões de WhatsApp que podem ser intensivas em recursos.
*   `pm2 logs tiktickets-backend`: Exibe os logs do processo `tiktickets-backend`.
*   `pm2 restart tiktickets-backend`: Reinicia o processo específico.
*   `pm2 save`: Salva a lista de processos atual para que sejam restaurados após um reboot do servidor.
*   `pm2 startup`: Gera e configura um script de inicialização para que o PM2 e seus processos sejam iniciados automaticamente com o sistema operacional.

## Backup

A implementação de uma estratégia de backup robusta é crucial para a recuperação de desastres e a integridade dos dados.

*   **Backup do Banco de Dados (PostgreSQL)**:
    Recomenda-se realizar um dump diário do banco de dados PostgreSQL. Ferramentas como `pg_dump` podem ser utilizadas para criar backups completos do esquema e dos dados.

    Exemplo de comando `pg_dump`:
    ```bash
    pg_dump -Fc -h localhost -U seu_usuario_db seu_banco_de_dados > /caminho/para/backups/tiktickets_db_$(date +%Y%m%d).bak
    ```
    Automatize este processo usando `cron` jobs em sistemas Linux.

*   **Backup das Sessões do WhatsApp**:
    A pasta `backend/.wwebjs_auth` contém os dados de sessão do WhatsApp Web, que correspondem aos logins dos clientes. Esta pasta é vital e deve ser incluída em sua estratégia de backup, especialmente se você planeja migrar o servidor ou restaurar sessões após uma falha.

    *   **Localização**: `backend/.wwebjs_auth` (relativo à raiz do backend).
    *   **Importância**: Contém os tokens e cookies que autenticam as sessões do WhatsApp. Sem eles, as sessões precisarão ser reconectadas manualmente.
    *   **Estratégia**: Inclua esta pasta em backups regulares e garanta que ela possa ser restaurada com facilidade em caso de necessidade.

Ao seguir este guia, você garantirá um deployment eficaz e uma operação contínua do TikTickets-zing v4 Enterprise em seu ambiente de produção.
