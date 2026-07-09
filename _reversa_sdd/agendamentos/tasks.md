# Agendamentos, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD de Schedules Unitárias
  - Origem no legado: `ScheduleController.ts`
  - Critério de pronto: Endpoint listando dados amarrados a um Contato e validando que o Payload venha com Data e Hora (ISO 8601).
  - Confiança: 🟢

- [ ] T-02, Varredura em Background (`SendMessagesSchendulesWbot`)
  - Origem no legado: Worker Scripts Node.
  - Critério de pronto: SetInterval / CronNode disparando query de `<=` no Banco de Dados para despachar os textos para o Proxy de mensagens.
  - Confiança: 🟢
