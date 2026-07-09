# Inventário do Sistema Legado — TikTickets-zing

Este documento apresenta o mapeamento completo e estruturado da superfície do projeto **TikTickets-zing**, incluindo estrutura de pastas, tecnologias, pontos de entrada, banco de dados, infraestrutura e sugestão de organização para engenharia reversa.

---

## 📊 Estatísticas e Linguagens

A análise estática dos arquivos sob controle de versão (descartando `node_modules`, `.git`, build, etc.) revelou a seguinte distribuição de linguagens e formatos:

| Linguagem / Extensão | Quantidade de Arquivos | Descrição / Uso |
| :--- | :---: | :--- |
| **TypeScript (`.ts`)** | 527 | Linguagem principal do Backend e testes unitários. |
| **Markdown (`.md`)** | 322 | Documentações, guias de agentes e documentação geral. |
| **Vue (`.vue`)** | 202 | Componentes e telas do frontend (Vue 2 e Vue 3). |
| **JavaScript (`.js` / `.mjs`)** | 170 | Scripts de build, configs de ferramentas e backend compilado. |
| **Imagens (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`)** | 94 | Ativos visuais, logotipos, QR codes de exemplo e screenshots. |
| **JSON (`.json`, `.jsonl`)** | 51 | Configurações do projeto e metadados de dependências. |
| **YAML/YML (`.yaml`, `.yml`)** | 19 | Arquivos Docker Compose, pipelines CI/CD e configurações do FOSSA. |
| **Python (`.py`)** | 5 | Scripts auxiliares de validação (ex: verificação do Vue). |
| **Shell/PowerShell (`.sh`, `.ps1`)** | 7 | Scripts de automação de instalação e utilitários. |
| **Estilos (`.css`, `.sass`)** | 8 | Arquivos de estilos globais e customizados. |

---

## 📁 Estrutura de Diretórios Top-Level

O projeto está estruturado em um formato multi-diretório (semelhante a um monorepo), separando backends e frontends:

```
TikTickets-zing/
├── backend/                  # Backend atual em Node.js (TypeScript)
├── backend-golang/           # Diretório vazio estruturado (Não implementado/Esboço)
├── frontend/                 # Frontend legado (Quasar v1 / Vue 2)
├── frontend-vue-3/           # Frontend ativo modernizado (Quasar v2 / Vue 3.5 / Vite)
├── docs/                     # Documentação de apoio
├── monitoring/               # Configurações e logs de infraestrutura de monitoramento
├── screenshots/              # Capturas de tela demonstrativas da interface
├── .github/                  # CI/CD Workflows (GitHub Actions)
├── .agents/ / .agent/        # Configurações de agentes de contexto de IA
├── .context/                 # Central de Playbooks de Contexto
└── .reversa/                 # Estado, configurações e plano do framework Reversa
```

---

## 🧩 Mapeamento de Módulos de Negócio

Com base na correspondência entre os arquivos de **Services** no backend, as **Pages** no frontend e as **Rotas/Modelos**, identificamos os seguintes módulos funcionais do sistema:

### 1. Autenticação e Sessão (`auth`)
*   **Finalidade**: Login de usuários comuns e super-administradores, geração de tokens JWT e controle de sessões ativas.
*   **Evidências**:
    *   Backend: [AuthRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/authRoutes.ts), [AuthServices.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/services/AuthServices), `AuthUserService.spec.ts`.
    *   Frontend: [Login.vue](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/src/pages/Login.vue).

### 2. Multi-Tenant / Empresas (`tenants`)
*   **Finalidade**: Gerenciamento de múltiplas empresas ou inquilinos isolados em um único banco de dados (SaaS Multi-tenant).
*   **Evidências**:
    *   Backend: [Tenant.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Tenant.ts), [tenantRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/tenantRoutes.ts), `TenantServices/`.
    *   Frontend: `empresassuper/` (painel de administração global).

### 3. Usuários e Permissões (`users`)
*   **Finalidade**: Gestão de usuários administradores e atendentes por tenant, com níveis de acesso.
*   **Evidências**:
    *   Backend: [User.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/User.ts), [userRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/userRoutes.ts), `UserServices/`, `AdminServices/`.
    *   Frontend: `usuarios/`, `usuariossuper/`.

### 4. Tickets de Atendimento (`tickets`)
*   **Finalidade**: Fila de chats, fluxo de triagem, controle de status do ticket (pendente, em atendimento, fechado), transferência entre atendentes e registro de logs.
*   **Evidências**:
    *   Backend: [Ticket.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Ticket.ts), [ticketRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/ticketRoutes.ts), `TicketServices/`, [Protocol.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Protocol.ts).
    *   Frontend: `atendimento/` (tela central de chat).

### 5. Contatos (`contacts`)
*   **Finalidade**: Cadastro de contatos/clientes, adição de campos customizados, tags/etiquetas de classificação e atribuição automática a carteiras de atendentes.
*   **Evidências**:
    *   Backend: [Contact.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Contact.ts), [contactRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/contactRoutes.ts), `ContactServices/`.
    *   Frontend: `contatos/`, `etiquetas/`.

### 6. Filas e Horários (`queues`)
*   **Finalidade**: Divisão do atendimento por setores/filas (suporte, comercial, etc.) e regras de horários de funcionamento (Business Hours).
*   **Evidências**:
    *   Backend: [Queue.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Queue.ts), [queueRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/queueRoutes.ts), `QueueServices/`.
    *   Frontend: `filas/`, `horarioAtendimento/`.

### 7. Chatbot / Fluxo Automático (`chatflow`)
*   **Finalidade**: Construtor visual de fluxos de decisão automatizados (FlowBuilder) e automações baseadas em palavras-chave (Auto-replies).
*   **Evidências**:
    *   Backend: [ChatFlow.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/ChatFlow.ts), [AutoReply.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/AutoReply.ts), `AutoReplyServices/`, `ChatFlowServices/`.
    *   Frontend: `chatFlow/`.

### 8. Integração de Canais (`channels`)
*   **Finalidade**: Conexão e sincronização com serviços de chat: WhatsApp (WebJS e API Oficial/WABA), Telegram Bot, Instagram MQTT e Facebook Messenger.
*   **Evidências**:
    *   Backend: [Whatsapp.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Whatsapp.ts), `WbotServices/` (WhatsApp Web), `WABA360/` (WhatsApp Cloud API), `TbotServices/` (Telegram), `InstagramBotServices/`, `FacebookServices/`.
    *   Frontend: `sessaoWhatsapp/` (painel de conexões).

### 9. Campanhas de Disparo (`campaigns`)
*   **Finalidade**: Criação de listas de transmissão para disparos em lote (mensagens de massa) agendados com suporte a variáveis.
*   **Evidências**:
    *   Backend: [Campaign.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Campaign.ts), [campaignRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/campaignRoutes.ts), `CampaignServices/`.
    *   Frontend: `campanhas/`.

### 10. Respostas Rápidas (`fast-replies`)
*   **Finalidade**: Cadastro de atalhos de texto para envio ágil de respostas pré-formatadas pelos atendentes (ex: `/obrigado`).
*   **Evidências**:
    *   Backend: [FastReply.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/FastReply.ts), [fastReplyRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/fastReplyRoutes.ts), `FastReplyServices/`.
    *   Frontend: `mensagensRapidas/`.

### 11. Configurações (`settings`)
*   **Finalidade**: Parâmetros de customização de comportamento do sistema, como limite de atendimentos, assinaturas em mensagens e integração global.
*   **Evidências**:
    *   Backend: [Setting.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/models/Setting.ts), [settingRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/settingRoutes.ts), `SettingServices/`.
    *   Frontend: `configuracoes/`.

### 12. Estatísticas e Relatórios (`statistics`)
*   **Finalidade**: Dashboards com contagem de tickets, tempo médio de espera (TME), tempo médio de atendimento (TMA) e produtividade por operador.
*   **Evidências**:
    *   Backend: [statisticsRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/statisticsRoutes.ts), `Statistics/` services.
    *   Frontend: `dashboard/`, `relatorios/`.

### 13. API Externa (`api-integration`)
*   **Finalidade**: Exposição de endpoints HTTP para disparo de mensagens e integrações de sistemas de terceiros (CRMs, ERPs) através de chaves de API.
*   **Evidências**:
    *   Backend: [apiExternalRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/apiExternalRoutes.ts), [apiConfigRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/apiConfigRoutes.ts), [WebHooksRoutes.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/routes/WebHooksRoutes.ts).
    *   Frontend: `api/`.

---

## ⚡ Detalhes da Arquitetura Técnica

### 📂 Backend (`/backend`)
Organizado sob o padrão clássico em camadas MVC do Express.js escrito em TypeScript:
*   `src/server.ts`: Inicializador da API HTTP (Express) e WebSockets (Socket.io).
*   `src/routes/`: Mapeamento de rotas HTTP por domínio.
*   `src/controllers/`: Recebimento de requisições HTTP, validação de payload com `yup` e repasse para a camada de serviços.
*   `src/services/`: Lógica central de negócio e interações complexas (dividido em subpastas de domínio).
*   `src/models/`: Declarações de models do ORM Sequelize com anotações TypeScript.
*   `src/database/`: Contém pastas `migrations` (145 arquivos) e `seeds` para definição do banco de dados relacional.
*   `src/libs/`: Inicializadores de bibliotecas críticas (Redis, RabbitMQ, Socket.io, instâncias Wbot, Telegraf).
*   `src/jobs/`: Processos agendados e trabalhadores de filas (Bull).

### 📂 Frontend Moderno (`/frontend-vue-3`)
Uma aplicação Single Page (SPA) baseada no Quasar Framework v2 e Vue 3:
*   `src/App.vue`: Ponto de entrada do renderizador Vue.
*   `src/boot/`: Conexões e bootstrap de bibliotecas na inicialização do Quasar (ex: axios, socket.io, tanstack-query).
*   `src/pages/`: Interfaces de tela agrupadas por domínio funcional.
*   `src/components/`: Elementos visuais reutilizáveis (modais, tabelas, seletores).
*   `src/stores/`: Gerenciamento global de estados baseado em Pinia.
*   `src/composables/`: Lógicas compartilhadas usando a Vue 3 Composition API.
*   `src/service/`: Camada cliente para chamadas HTTP do axios.

---

## 🔑 Configurações e Pontos de Entrada

### Arquivos de Entrada (Entry Points)
*   **Backend**: [backend/src/server.ts](file:///D:/Git%20Hub/TikTickets-zing/backend/src/server.ts) (Inicia o servidor na porta configurada, estabelecendo conexão com Sequelize, Redis, RabbitMQ e inicializando as conexões de bots).
*   **Frontend**: [frontend-vue-3/index.html](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/index.html) + [frontend-vue-3/src/App.vue](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/src/App.vue).
*   **Frontend (Prod Server)**: [frontend-vue-3/server.js](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/server.js) (Express estático simples para servir o build compilado do Quasar/Vite).

### Arquivos de Configuração Críticos
*   **Ambiente**:
    *   [backend/.env.example](file:///D:/Git%20Hub/TikTickets-zing/backend/.env.example): Variáveis do BD PostgreSQL, portas, credenciais Redis, chaves JWT, Sentry, RabbitMQ e integradores.
    *   [frontend-vue-3/.env.example](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/.env.example): Declarações de URL base da API e endpoints do WebSocket.
*   **Banco de Dados**:
    *   [backend/.sequelizerc](file:///D:/Git%20Hub/TikTickets-zing/backend/.sequelizerc): Configuração dos caminhos de migrações e modelos para a CLI do Sequelize.
*   **Bundlers**:
    *   [frontend-vue-3/quasar.config.js](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/quasar.config.js): Define toda a cadeia de build com Vite, plugins, auto-imports e pwa/manifest.
*   **Compiladores e Testes**:
    *   [backend/tsconfig.json](file:///D:/Git%20Hub/TikTickets-zing/backend/tsconfig.json) e [backend/jest.config.js](file:///D:/Git%20Hub/TikTickets-zing/backend/jest.config.js).
    *   [frontend-vue-3/vitest.config.mjs](file:///D:/Git%20Hub/TikTickets-zing/frontend-vue-3/vitest.config.mjs).

---

## ⚙️ Infraestrutura e Observabilidade

### Integrações de Rede e Mensageria
*   **Realtime**: Conexões de Websocket persistentes bidirecionais via `socket.io` ligando a interface às atualizações de tickets, novas mensagens e status de conexões.
*   **Filas e Background**: Redis acoplado ao `bull` para controle de execução de tarefas assíncronas em lote (como disparos de campanhas em massa, processamento de mídias pesadas e retentativas).
*   **Mensageria**: RabbitMQ (`amqplib`) utilizado para barramento de integração escalável entre canais.

### Observabilidade e Monitoramento
*   **Logs**: Integrados de forma nativa com Winston e Pino para controle estruturado de output (com logs salvos na pasta `/backend/logs`).
*   **Rastreamento**: OpenTelemetry (`@opentelemetry/sdk-node`) configurado para medição e distribuição de métricas de infra, integrando com o Sentry e NewRelic.

### Docker e CI/CD
*   **Dockerfiles**: Tanto o backend quanto o frontend-vue-3 possuem `Dockerfile` próprios baseados em Node.js Alpine.
*   **Orquestração**: Na raiz, existem [docker-compose.yml](file:///D:/Git%20Hub/TikTickets-zing/docker-compose.yml) e [docker-compose.yaml](file:///D:/Git%20Hub/TikTickets-zing/docker-compose.yaml) contendo definições prontas para subir PostgreSQL, Redis, RabbitMQ, Backend e Frontend.
*   **CI/CD**: Workflows de GitHub Actions configurados em `.github/workflows/` automatizam o build e push das imagens do backend e frontend para registros Docker.

---

## 🧪 Cobertura de Testes

A cobertura de testes no projeto atual é **muito baixa**:
*   **Backend**: Testes unitários focados apenas em serviços de usuário (`backend/src/__tests__/unit/User/`), utilizando `Jest` e `ts-jest`. Outros fluxos principais não possuem testes mapeados.
*   **Frontend**: Existe apenas um arquivo de teste de exemplo (`frontend-vue-3/src/components/__tests__/Example.spec.js`) configurado com `Vitest` e `happy-dom`.

---

## 🗂️ Sugestão de Organização das Specs

*   **Granularidade Recomendada**: `module` (Módulo).
*   **Justificativa**: A estrutura do projeto é fortemente dividida em domínios de negócio nas pastas de serviços do backend (`backend/src/services/` -> `TicketServices`, `ContactServices`, `UserServices`, etc.) e na estruturação de páginas do frontend (`frontend-vue-3/src/pages/` -> `atendimento`, `contatos`, `campanhas`, `chatFlow`, etc.).
*   **Sinais Identificados**:
    1.  Subpastas organizadas de serviços no backend em `backend/src/services/*Services`.
    2.  Subpastas por módulos na pasta de páginas do frontend em `frontend-vue-3/src/pages/*`.
