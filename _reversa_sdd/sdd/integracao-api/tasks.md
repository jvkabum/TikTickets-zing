# Integração API Externa, Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Módulo Canais (WhatsApp) 100% funcional, capaz de disparar mensagens programaticamente.
- [ ] Middlewares de autenticação Bearer preparados para validação no banco.

## Tarefas

- [ ] T-01, Entidades de Configuração e Log da API
  - Origem no legado: `backend/src/models/ApiConfig.ts`, `ApiMessage.ts`
  - Critério de pronto: Tabela para gerir chaves de API (`token`, `name`, `sessionId`, `tenantId`) e tabela de log com status de entrega.
  - Confiança: 🟢

- [ ] T-02, Serviços Base de Credenciais
  - Origem no legado: Rotas de Admin do Painel para `ApiConfig`
  - Critério de pronto: CRUD das credenciais no painel do administrador, com rotina de geração automática de UUID Token no banco.
  - Confiança: 🟢

- [ ] T-03, Middleware de Auth para API
  - Origem no legado: `backend/src/middleware/isAuthApi.ts`
  - Critério de pronto: Função Express que intercepta o header, consulta o token em `ApiConfig` e injeta a sessão do WhatsApp no objeto de Request para os próximos handlers.
  - Confiança: 🟢

- [ ] T-04, Endpoint Público de Disparo (`/api/messages/send`)
  - Origem no legado: `backend/src/controllers/ApiController.ts`
  - Critério de pronto: Rota validada pelo T-03 que chama os serviços locais de disparo de mensagem.
  - Confiança: 🟢

- [ ] T-05, Engine de Webhooks de Retorno (Callbacks)
  - Origem no legado: WbotListeners interceptando ACK.
  - Critério de pronto: Se a urlServiceStatus estiver configurada, disparar requisição via biblioteca HTTP (Axios) avisando o ERP externo que o cliente leu a notificação.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Falha de Auth Externa: Fazer POST em `/api/messages/send` com token inválido. Garantir retorno 401 ou 403 sem processar.
- [ ] TT-02, Teste de Webhook: Mockar um servidor HTTP rodando localmente (Ex: ngrok) e verificar se o backend enviou a carga de `ACK: 3 (Read)` para ele.

## Ordem Sugerida
1. T-01 e T-02: Setup do ambiente no Painel.
2. T-03: Camada de segurança.
3. T-04: O núcleo da entrega de valor (Disparo).
4. T-05: A cereja do bolo (Feedback pro ERP).

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica de conhecimento pendente para esta feature.
