# 📊 TikTickets-zing - Guia de Instalação no Coolify

Este guia detalha como configurar a Stack de Observabilidade (Métricas, Logs, Traces e Erros) no seu painel Coolify.

## 🚀 Componentes Inclusos
- **Grafana**: Visualização de dashboards.
- **Prometheus**: Armazenamento de métricas.
- **Loki**: Agregação de logs (substitui o ELK/Kibana).
- **Jaeger**: Rastreamento de requisições (Distributed Tracing).
- **Vector**: Coletor de logs do Docker em tempo real.
- **OpenTelemetry Collector**: O "cérebro" que recebe dados do seu app e distribui para a stack.
- **GlitchTip**: Alternativa leve ao Sentry para captura de erros em localhost.

---

## 🛠️ Passo a Passo da Instalação

### 1. Criar novo Recurso no Coolify
1. Vá em **Project** -> **Environment**.
2. Clique em **+ New Resource**.
3. Selecione **Docker Compose**.
4. Cole o conteúdo do arquivo `docker-compose.yaml` (o que está na raiz do projeto).
5. Defina um nome para a stack (ex: `observability-stack`).

### 2. Configurações Prévias Requisitadas
A stack está configurada para usar bancos de dados externos (Postgres e Redis) para o GlitchTip. Certifique-se de que eles estão rodando no seu Coolify:

- **Postgres**: Configure seu Host, Usuário e Senha nas variáveis.
- **Redis**: Configure seu Host e Senha nas variáveis.

### 3. Variáveis de Ambiente
No menu **Variables** do Coolify, adicione as seguintes (ajuste conforme necessário):

| Variável | Valor Padrão / Sugestão | Descrição |
| :--- | :--- | :--- |
| `GRAFANA_ADMIN_USER` | `admin` | Usuário inicial do Grafana |
| `GRAFANA_ADMIN_PASSWORD` | `(sua_senha)` | Senha inicial do Grafana |
| `POSTGRES_HOST` | `(seu_host_db)` | Host do Postgres no Coolify |
| `POSTGRES_USER` | `postgres` | Usuário do Postgres |
| `POSTGRES_PASSWORD` | `(sua_senha_db)` | Senha do Postgres |
| `POSTGRES_DB` | `postgres` | Nome do banco de dados |
| `REDIS_HOST` | `(seu_host_redis)` | Host do Redis no Coolify |
| `REDIS_USER` | `admin` | Usuário do Redis |
| `REDIS_PASSWORD` | `123456` | Senha do Redis |
| `SENTRY_DSN` | `""` | DSN do Sentry Cloud (Opcional) |
| `GLITCHTIP_DSN` | `""` | DSN do GlitchTip Local (Pegar após o primeiro login) |
| `GLITCHTIP_SECRET_KEY` | `gerar-uma-chave-longa` | Chave de segurança para o GlitchTip |

### 4. Configuração de Rede e Domínios
Para acessar cada serviço via navegador, você precisa configurar os domínios (FQDN) no Coolify apontando para as portas corretas:

- **Grafana**: Porta `3000`
- **Prometheus**: Porta `9090`
- **Jaeger (UI)**: Porta `16686`
- **GlitchTip**: Porta `8000`

> **Importante**: A stack usa a rede externa `coolify`. Certifique-se de que essa rede existe no seu Docker host (o Coolify cria por padrão).

### 5. Configurações Críticas (Coolify Dashboard)
Nas configurações do recurso (**Settings**):
1. **Base Directory**: `/`
2. **Docker Compose Location**: `/docker-compose.yaml`
3. **Preserve repository during deployment**: Marque como **ENABLED** (Crucial para que os arquivos de configuração das subpastas sejam encontrados).

---

## 🔍 Como verificar se está funcionando?

1. **Grafana**: Acesse o domínio configurado. Vá em `Dashboard` -> `Browse`. Já existem fontes de dados pré-configuradas para Prometheus e Loki.
2. **Logs**: No Grafana, vá em `Explore`, selecione o `Loki` e busque por `{job="vector-docker"}`. Você verá os logs de todos os seus containers em tempo real.
3. **Erros**: Acesse o GlitchTip, crie seu projeto. Pegue a DSN gerada e coloque-a na variável `GLITCHTIP_DSN` da stack no Coolify. Faça um Redeploy.

---
## 💡 Dicas de Performance
Esta stack foi otimizada para o **TikTickets-zing** usando bancos de dados compartilhados, reduzindo o consumo de RAM em aproximadamente 1GB se comparado a uma instalação padrão.
