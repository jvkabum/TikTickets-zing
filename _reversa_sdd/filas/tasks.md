# Filas (Queues), Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD de Filas com validações e proteção FK
  - Origem no legado: `backend/src/controllers/QueueController.ts`
  - Critério de pronto: Endpoint que exija o payload `queue` (nome) validado por Yup e bloqueie a instrução `.destroy()` reescrevendo o erro de chaves estrangeiras com a mensagem customizada de sistema `ERR_QUEUE_TICKET_EXISTS`.
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Testar deleção de Fila sem tickets.
- [ ] TT-02, Testar deleção de Fila já atrelada ao Ticket de ID "1". Confirmar se recebe 404.
