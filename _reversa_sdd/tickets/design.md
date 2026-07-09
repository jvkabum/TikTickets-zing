# Tickets (Atendimentos), Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/tickets` | Filtros (search, status, queueIds) | `{ tickets, count, hasMore }` | 200, 400 |
| POST | `/tickets` | `contactId`, `userId`, `queueId` | `Ticket` Completo | 201, 400 |
| GET | `/tickets/:id` | `ticketId` na URL | `Ticket` | 200, 404 |
| PUT | `/tickets/:id` | `TicketUpdatePayload` | `Ticket` | 200, 404 |
| GET | `/tickets/:id/logs` | `ticketId` | `LogTicket[]` | 200, 404 |

## Fluxo Principal
1. O contato manda a primeira mensagem (detectado pela integração de canal) gerando a criação imperativa de um `Ticket` em estado `pending`.
2. A API agrupa os contadores primários do Bot e fila (`unreadMessages`, `botRetries`, `lastInteractionBot`).
3. O frontend consome `/tickets` enviando parâmetros restritos, e o Backend só recupera os tickets a depender das Filas designadas ao operador autenticado.
4. O operador aciona o `/tickets/:id` com verbo PUT, alterando para `open` e designando seu próprio `userId`. O sistema gera um histórico novo em `LogTicket`.

## Fluxos Alternativos
- **Fechamento Automático:** Gatilhos ou cron jobs (DaysToClose) atualizam instâncias inteiras, fechando threads antigas com `status === "closed"` em volume sem passar pela camada de UX do Frontend.
- **Transação Interna Pupa:** No ato de encerramento via operador, a camada invoca secretamente o gerador interno de mensagem, substituindo a interpolação textual do canal e forçando o salvamento de uma Despedida nativa no banco.

## Dependências
- **Pupa**, library NPM usada agressivamente no BackEnd para interpolação de strings como nomes e protocolos dinamicamente.
- **MessageSystemServices**, o módulo Tickets depende pesadamente das funções de CreateMessage para conseguir efetivar respostas automáticas aos clientes.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Arquitetura Fat Model/Service | Os eventos (Hooks) disparam para dezenas de filas de Sockets ao mesmo tempo | 🟢 |
| Relacionamento Completo via Eager Loading | Sequelize inclui Queue, User, Contact, Tags, AutoReplies quase sempre na extração primária | 🟢 |

## Estado Interno
- O Root Model guarda o relógio integral (`createdAt`, `startedAttendanceAt`, `closedAt`, `lastInteractionBot`) — dados valiosíssimos que sustentam totalmente a base matemática da Unit de Estatísticas.

## Observabilidade
A tabela pivô/auditora `LogTickets` cumpre o papel magistral de Telemetria sobre todo o histórico físico das passagens que o ticket obteve entre vários membros da equipe.

## Riscos e Lacunas
- 🟡 Complexidade alta de WebSocket. A cada mudança de estado o servidor inunda várias salas com Broadcasts. Risco de afunilamento de memória.
