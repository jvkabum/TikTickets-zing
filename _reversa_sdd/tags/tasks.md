# Tags, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD de Labels e Cores
  - Origem no legado: `backend/src/controllers/TagController.ts`
  - Critério de pronto: Cadastrar chaves Hex (`color`) validadas e amarradas ao Tenant.
  - Confiança: 🟢

- [ ] T-02, Associações N:M (Ticket)
  - Origem no legado: `backend/src/controllers/TicketTagController.ts`
  - Critério de pronto: Rota de Toggle que anexe o ID da tag no ID do Ticket na tabela Pivô de cruzamento, emitindo o Socket "UPDATE_TICKET" pro front reposicionar a interface Kanban.
  - Confiança: 🟢
