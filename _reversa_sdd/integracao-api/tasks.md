# Integração API Externa, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Autenticador Headless (isAPIAuth Middleware)
  - Origem no legado: `backend/src/middleware/isAPIAuth.ts`
  - Critério de pronto: Interceptar a URL do webhook injetando o `tenantId` da companhia validando o Bearer Token contido no BD (Tabela `ApiConfigs`).
  - Confiança: 🟢

- [ ] T-02, Endpoint Desacoplado SendMessageAPI
  - Origem no legado: `backend/src/controllers/APIConfigController.ts`
  - Critério de pronto: Receber carga útil Polimórfica (Text ou MediaURL). Responder HTTP 200 Ok imediatamente após converter e enfiar os dados brutos no `Queue.add` (Bull) para o Worker real despachar no WhatsAppJS daquela conexão.
  - Confiança: 🟢

- [ ] T-03, Endpoint Desfibrilador de Sessão
  - Origem no legado: `backend/src/controllers/APIConfigController.ts` (startSession)
  - Critério de pronto: Instigar o `StartWhatsAppSession` passando a ID da conexão, exigindo que a ponte do Baileys recarregue de fora para dentro.
  - Confiança: 🟢
