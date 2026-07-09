# Atendimentos (Tickets), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `User`, `Tenant`, `Contact`, `Whatsapp` e `Queue` mapeadas e persistidas.
- [ ] Tabela de Auditoria `LogTicket` desenhada.

## Tarefas

- [ ] T-01, Implementar Entidade Principal `Ticket` e Auditoria `LogTicket`
  - Origem no legado: `backend/src/models/Ticket.ts`, `backend/src/models/LogTicket.ts`
  - Critério de pronto: Banco relacional pronto com FKs para todas as frentes (Usuário, Contato, Canal, etc) e colunas temporais de métricas (`closedAt`, `startedAttendanceAt`).
  - Confiança: 🟢

- [ ] T-02, Serviço de Criação e Roteamento (`CreateTicketService`)
  - Origem no legado: `backend/src/services/TicketServices/CreateTicketService.ts`
  - Critério de pronto: Método que insere Ticket novo (ou resgata aberto), vincula protocolo e gera log inicial (`create`).
  - Confiança: 🟢

- [ ] T-03, Serviço de Atualização e Encerramento (`UpdateTicketService`)
  - Origem no legado: `backend/src/services/TicketServices/UpdateTicketService.ts`
  - Critério de pronto: Altera status, vincula Usuário/Fila. Se `closed`, injeta template de Despedida (via `pupa`) e invoca disparo de mensagem. Grava Log de alteração.
  - Confiança: 🟢

- [ ] T-04, Inbox Híbrido (`ListTicketsService`)
  - Origem no legado: `backend/src/services/TicketServices/ListTicketsService.ts`
  - Critério de pronto: Retorna tickets paginados, mesclando regras OR/AND do Sequelize para restringir apenas as filas que o Atendente tem acesso.
  - Confiança: 🟢

- [ ] T-05, Controllers e Emissão Real-time
  - Origem no legado: `backend/src/controllers/TicketController.ts`
  - Critério de pronto: Endpoints REST amarrados, com todos os passos emitindo `.emit()` no canal Socket (`[tenantId]:ticket`).
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Concorrência (Race Condition): Simular 2 requests de "Aceitar" no mesmo ticket em menos de 10ms para validar se o sistema não corrompe a atribuição.
- [ ] TT-02, Validar injeção de template `pupa` garantindo que "{name}" é trocado pelo nome do Contato antes de ir pro bot.

## Ordem Sugerida
1. T-01: Base estrutural central.
2. T-02: Criação é a porta de entrada dos webhooks do canal.
3. T-03: Roteamento (Trabalho do Humano).
4. T-04: Exibição (Inbox Frontend).
5. T-05: Exposição REST e Sockets.

## Lacunas Pendentes (🔴)
Falta clareza sobre como lidar com "Lock Pessimista" na transação do banco ao aceitar tickets para evitar duplicidade de atendimento, que pode exigir ajustes na migration.
