# Filas (Queues), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `Tenant` operacionais.
- [ ] Validações Multi-tenant padronizadas no Express.

## Tarefas

- [ ] T-01, Implementar Entidade `Queue`
  - Origem no legado: `backend/src/models/Queue.ts`
  - Critério de pronto: Tabela criada com campos `queue` (nome), `color`, `greetingMessage`, `outOfHoursMessage` e coluna JSON `schedules`. Associada fortemente via FK `tenantId`.
  - Confiança: 🟢

- [ ] T-02, Serviços de CRUD Base (`CreateQueueService`, `UpdateQueueService`, etc)
  - Origem no legado: Pasta `backend/src/services/QueueServices/`
  - Critério de pronto: Operações de banco de dados, protegidas por `tenantId`, implementadas e validando integridade do schema de `schedules`.
  - Confiança: 🟢

- [ ] T-03, Exposição REST (Controllers)
  - Origem no legado: `backend/src/controllers/QueueController.ts`
  - Critério de pronto: Todos os métodos HTTP (GET, POST, PUT, DELETE) com validação de payload (ex: exigindo formato '#RRGGBB' na cor) via middlewares.
  - Confiança: 🟢

- [ ] T-04, Proteção de Integridade na Deleção
  - Origem no legado: Análise comportamental da restrição `SET NULL`.
  - Critério de pronto: O serviço de deleção deve buscar se a Fila possui Tickets. Caso positivo, bloqueia a requisição (HTTP 409 Conflict) exigindo transferência manual prévia (ou migra tudo para NULL intencionalmente, a confirmar com o PO).
  - Confiança: 🟡

- [ ] T-05, Integração de Emissão Real-time
  - Origem no legado: `backend/src/controllers/QueueController.ts` (blocos io.emit)
  - Critério de pronto: O painel recebe os eventos `queue` (create/update/delete) isolados por `tenantId`.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar payload de criação de Fila enviando `color: "azul"`. O validador deve rejeitar, exigindo formato hexa (`#0000FF`).
- [ ] TT-02, Simular exclusão de Fila com 1 Ticket atrelado e verificar a constraint de Foreign Key / Lógica de Aplicação funcionando corretamente sem gerar `Error 500`.

## Ordem Sugerida
1. T-01: Model.
2. T-02: Services de manipulação.
3. T-04: Implementar o Hard Block de deleção antes de expor a rota.
4. T-03 e T-05: API final com Sockets.

## Lacunas Pendentes (🔴)
- A lógica do legado permite "deletar" filas em uso e deixar a UI inconsistente? A implementação moderna na T-04 mitigará esse risco.
