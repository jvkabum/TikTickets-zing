# Arquitetura Técnica: TikTickets-zing

O TikTickets segue uma arquitetura baseada em serviços com foco em escalabilidade e multi-tenancy.

## Estrutura de Diretórios
- `backend/src/controllers`: Lógica de controle e rotas da API.
- `backend/src/models`: Definição das entidades do banco de dados (Sequelize).
- `backend/src/services`: Camada de lógica de negócio, dividida por domínio (User, Ticket, Wbot).
- `backend/src/libs/wbot.ts`: Núcleo da integração com o WhatsApp.
- `backend/src/database`: Migrações e sementes do banco de dados.

## Integração WhatsApp
- Utilizamos a biblioteca `whatsapp-web.js`.
- O sistema gerencia múltiplas sessões do Chromium através do Puppeteer.
- **Polling Ativo**: Implementamos um sistema de verificação de conexão a cada 2 segundos para garantir estabilidade.
- **Persistência**: As sessões são salvas em `.wwebjs_auth/` e preservadas durante o boot do servidor.

## Frontends: A Transição
O sistema está em fase de transição tecnológica:
1. **Legado (`frontend`)**: Vue 2.7, Vuex. **Não deve receber novas funcionalidades**.
2. **Moderno (`frontend-vue-3`)**: Vue 3.5, Quasar 2.17, Composition API, Pinia, Vue Query, Vite. **Todo novo desenvolvimento deve ocorrer aqui**.

## Comunicação em Tempo Real
- **Socket.io**: Utilizado para enviar atualizações de tickets e mensagens para o frontend instantaneamente.
- **Backend**: `socket.io` v3.
- **Frontend**: `socket.io-client` v3.
