# Dependências do Sistema Legado — TikTickets-zing

Este documento lista todas as dependências identificadas nos projetos do ecossistema TikTickets-zing.

---

## 🖥️ Backend (`backend/package.json`)

### Dependências de Runtime
*   **Express**: `^4.19.2` — Framework web principal.
*   **Sequelize**: `^5.22.5` — ORM SQL.
*   **Sequelize-TypeScript**: `^1.1.0` — Suporte a TypeScript para Sequelize.
*   **pg**: `^8.11.3` — Driver do PostgreSQL.
*   **Redis**: `^3.1.2` / **ioredis**: `^5.2.5` — Conexão com Redis.
*   **Bull**: `3.22.8` / **Bull-Board**: `^1.4.1` — Gerenciamento e painel de filas.
*   **Socket.io**: `^3.1.2` / **Socket.io-Redis**: `^6.1.1` — Comunicação em tempo real distribuída.
*   **whatsapp-web.js**: `^1.34.7` — Integração e controle do WhatsApp Web.
*   **telegraf**: `^4.16.3` — Integração com o bot do Telegram.
*   **instagram_mqtt**: `^1.2.3` / **instagram-private-api**: `^1.46.1` / **@androz2091/insta.js**: `^1.6.1` — Integração com canais Instagram.
*   **messaging-api-messenger**: `^1.1.0` — Integração com Facebook Messenger.
*   **amqplib**: `^0.10.3` — Cliente para RabbitMQ (mensageria).
*   **asterisk-manager**: `^0.2.0` — Integração com PABX/Asterisk.
*   **fluent-ffmpeg**: `^2.1.2` / **ffmpeg-static**: `^5.3.0` — Conversão e processamento de áudio/vídeo.
*   **bcryptjs**: `^2.4.3` — Hashing de senhas.
*   **jsonwebtoken**: `^9.0.2` — Autenticação via tokens JWT.
*   **pino**: `^6.10.0` / **pino-http**: `^5.6.0` / **winston**: `^3.11.0` — Logs de alta performance.
*   **dotenv**: `^16.4.5` — Carregamento de variáveis de ambiente.
*   **@opentelemetry/sdk-node**: `^0.49.1` (e pacotes relacionados) — Rastreabilidade e observabilidade.
*   **@sentry/node**: `^10.38.0` — Monitoramento de erros e exceções.
*   **xlsx**: `^0.18.5` — Manipulação de planilhas.
*   **yup**: `^1.3.3` — Validação de schemas.

### Dependências de Desenvolvimento (DevDependencies)
*   **TypeScript**: `^4.8.4` — Linguagem principal compilada.
*   **ts-node-dev**: `^1.0.0-pre.63` — Execução direta de TS em desenvolvimento com hot reload.
*   **jest**: `^26.6.0` / **ts-jest**: `^26.4.1` / **supertest**: `^5.0.0` — Suíte de testes.
*   **eslint**: `^7.10.0` (com plugins) — Linter de código.
*   **nodemon**: `^2.0.4` — Monitoramento de arquivos para restart do server.
*   **sequelize-cli**: `^6.4.1` — Ferramenta de linha de comando do Sequelize.
*   **javascript-obfuscator**: `^4.0.2` — Ferramenta de ofuscação de código.

---

## ⚡ Frontend Moderno (`frontend-vue-3/package.json`)

### Dependências de Runtime
*   **Vue**: `^3.5.0` — Framework core (Composition API).
*   **Quasar**: `^2.17.0` / **@quasar/extras**: `^1.16.3` — Framework de componentes UI e design system.
*   **Pinia**: `^3.0.4` — Gerenciamento de estado descentralizado.
*   **vue-router**: `^4.0.0` — Roteamento do Vue.
*   **@tanstack/vue-query**: `^5.92.6` — Gerenciamento e cache de requisições de API.
*   **axios**: `^1.4.0` — Cliente HTTP.
*   **socket.io-client**: `^3.1.3` — Cliente para comunicação realtime.
*   **wavesurfer.js**: `^7.0.0` — Visualização gráfica e reprodução de áudio.
*   **lamejs**: `^1.2.1` / **mic-recorder-to-mp3**: `^2.2.2` — Gravação e conversão de áudio para MP3 no browser.
*   **drawflow**: `0.0.59` — Construtor visual de fluxos de chat (FlowBuilder).
*   **codemirror**: `^6.0.2` / **vue-codemirror**: `^6.1.1` — Editor de código interativo.
*   **apexcharts**: `^4.0.0` / **vue3-apexcharts**: `^1.4.1` — Gráficos e dashboards.
*   **zod**: `^3.25.76` / **yup**: `^1.7.1` — Validação de schemas.
*   **vee-validate**: `^4.15.1` / **@vuelidate/core**: `^2.0.3` — Validação de formulários.
*   **@vueuse/core**: `^14.1.0` — Coleção de utilitários composition API.
*   **qrcode.vue**: `^3.4.1` — Geração de QR Code para conexões de WhatsApp.
*   **vue3-emoji-picker**: `^1.1.8` — Seletor de emojis nos chats.
*   **vuedraggable**: `^4.1.0` — Ordenação drag-and-drop.
*   **@opentelemetry/sdk-trace-web**: `^1.22.0` (e pacotes relacionados) — Observabilidade no client.
*   **@sentry/vue**: `^10.38.0` — Rastreamento de erros no client.

### Dependências de Desenvolvimento (DevDependencies)
*   **@quasar/app-vite**: `^2.4.0` — Compilador e bundler baseado em Vite para Quasar.
*   **vitest**: `^4.0.17` / **@vue/test-utils**: `^2.4.6` / **happy-dom**: `^20.3.0` — Suíte de testes unitários.
*   **eslint**: `^8.40.0` (com plugins Vue 3 e Prettier) — Verificação estática de código.
*   **prettier**: `^3.8.0` — Formatador de estilo de código.
*   **unplugin-auto-import**: `^21.0.0` / **unplugin-vue-components**: `^30.0.0` — Auto-importação de componentes e APIs Vue.

---

## 🎨 Frontend Legado (`frontend/package.json`)

### Dependências de Runtime
*   **Vue**: `^2.7.14` — Framework core (Options API).
*   **Quasar**: `^1.22.10` / **@quasar/extras**: `^1.16.3` — UI Components v1.
*   **socket.io-client**: `^3.1.3` — Cliente realtime.
*   **wavesurfer.js**: `^6.6.4` — Visualização de áudio (versão legada).
*   **drawflow**: `0.0.59` — Construtor de fluxo (FlowBuilder).
*   **v-emoji-picker**: `^2.3.3` — Seletor de emojis (legado).
*   **vuedraggable**: `^2.24.3` — Drag-and-drop para Vue 2.
*   **vuelidate**: `^0.7.7` — Validação (legada).
*   **axios**: `^1.4.0` — Cliente HTTP.

### Dependências de Desenvolvimento (DevDependencies)
*   **@quasar/app**: `^2.4.3` — Compilador baseado em Webpack para Quasar v1.
*   **eslint**: `^6.8.0` — Linter legado.
