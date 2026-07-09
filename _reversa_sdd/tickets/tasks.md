# Tickets (Atendimentos), Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Módulos Root e Adjuntos totalmente preparados (Tenant, User, Contact, Queue e Message).
- [ ] Tabelas `Tickets` e `LogTickets` integradas no banco de dados.

## Tarefas

- [ ] T-01, CRUD de Tickets com Filtros Complexos
  - Origem no legado: `backend/src/controllers/TicketController.ts` (index / show)
  - Critério de pronto: Endpoint de leitura que filtre estritamente dados pelo `tenantId` da sessão e resolva relacionamentos Eager Loader (retornando o contato amarrado, última mensagem, tags, etc).
  - Confiança: 🟢

- [ ] T-02, Controle de Estados (Open, Pending, Closed)
  - Origem no legado: `backend/src/controllers/TicketController.ts` (update)
  - Critério de pronto: Transição de Status deve atualizar relógios obrigatórios `startedAttendanceAt` (se assumindo atendimento) ou `closedAt` (se encerrando o chamado).
  - Confiança: 🟢

- [ ] T-03, Historiador Automático (LogTickets)
  - Origem no legado: Hooks e lógicas imersas nas transições
  - Critério de pronto: Toda transferência de operador ou fila deve injetar passivamente um novo registro na tabela `LogTicket` sem bloqueios síncronos na Thread.
  - Confiança: 🟢

- [ ] T-04, Disparo Condicional de Farewell (Despedida)
  - Origem no legado: `backend/src/controllers/TicketController.ts` (Update ticket)
  - Critério de pronto: Ao constatar Status == "closed", avaliar se a integração atrelada (`Whatsapp`) previu `farewellMessage` e despachar mensagem processada pelo Pupa.
  - Confiança: 🟢

## Tarefas de Teste
- [ ] TT-01, Testar o fluxo orgânico simulando a entrada do robô (Pending -> Open) validando relógio.
- [ ] TT-02, Validar preenchimento autônomo das Strings via Template (Pupa) na mensagem final.

## Ordem Sugerida
1. T-01 e T-02. O sistema sem tickets morre.
2. T-03 (pode ser empurrado para uma branch secundária ou job futuro).

## Lacunas Pendentes (🔴)
- Avaliar a saúde da CPU frente à pesada carga dos websockets do `TicketController` que dispara dezenas de hooks no mesmo segundo para cada transição simples.
