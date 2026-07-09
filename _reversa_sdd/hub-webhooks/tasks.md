# Hub Webhooks, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Endpoints de Challenge de Verificação
  - Origem no legado: Rotas de Handshake (GET).
  - Critério de pronto: Rota que devolve o VerifyToken em string pura (`req.query['hub.challenge']`) em 200 OK para o Meta Developer aprovar o Webhook.
  - Confiança: 🟢

- [ ] T-02, Parser de Recepção (POST)
  - Origem no legado: Rotas Post e Processadores `Messenger/Instagram/360`.
  - Critério de pronto: Tratar o JSON de entrada da Meta e converter na mesma Model Base emulada pelo Baileys.
  - Confiança: 🟢
