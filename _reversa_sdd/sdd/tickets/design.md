# Atendimentos (Tickets), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/tickets` | `QueryParams (search, page, status, showAll, queueIds, withUnreadMessages)` | `{ tickets, count, hasMore }` | 200, 401 |
| GET | `/tickets/:ticketId` | `ticketId` | `Ticket (com mensagens agendadas e tags)` | 200, 401, 404 |
| POST | `/tickets` | `TicketCreate` | `Ticket` | 200, 401, 400 |
| PUT | `/tickets/:ticketId` | `TicketUpdate (status, userId, queueId)` | `Ticket` | 200, 400, 404 |
| DELETE | `/tickets/:ticketId` | `ticketId` | `200 OK` | 200, 404, 401 |
| GET | `/tickets/:ticketId/logs` | `ticketId` | `[LogTicket]` | 200, 404, 401 |

## Fluxo Principal
1. **Listagem Inbox:** `ListTicketsService` constrói queries complexas (Sequelize) misturando Filtros de Fila do Atendente, Status (open, pending, closed), e `unreadMessages`.
2. **Atualização (Aceite/Transferência/Encerramento):** O payload entra em `UpdateTicketService`.
3. Se o novo status for `closed`:
   - Grava `closedAt`.
   - Verifica se o `Whatsapp` amarrado tem `farewellMessage`. Se sim, usa a biblioteca `pupa` para substituir variáveis (ex: `{name}`) na string e invoca `CreateMessageSystemService` enviando a mensagem ao cliente.
   - Dispara trigger de avaliação (NPS/CSAT) se configurado.
4. Para todas as mudanças: Insere registro em `LogTicket` detalhando "transfer", "open", etc.
5. **Real-time:** Manda Socket para o `tenantId` com o JSON do Ticket modificado, permitindo que as telas dos operadores movam o card de Fila sem refresh.

## Fluxos Alternativos
- **Mensagens Agendadas:** Na visualização de 1 Ticket (`/tickets/:ticketId`), o sistema faz uma sub-query ou include condicional para buscar mensagens não enviadas onde `scheduleDate > now` e pendura na propriedade `.scheduledMessages`.
- **Criação Direta (Contato via Bot/WWebJS):** O trigger real de criação (`CreateTicketService`) muitas vezes vem não de HTTP REST, mas dos listeners do Baileys quando um cliente desconhecido envia mensagem, gerando status "pending" de forma assíncrona.

## Dependências
- `pupa`: Usado intensamente no `UpdateTicketService` para injetar variáveis nas mensagens de sistema (saudação, despedida).
- `Socket.io`: Orquestra o "Inbox" reagindo a mudanças instantaneamente.
- Serviços do WhatsApp (`CreateMessageSystemService`): O Ticket em si não envia a mensagem, ele delega para a fila/serviço responsável por falar com a API/Puppeteer.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Desacoplamento de Emissão de Msg | `UpdateTicketService` (chama serviços externos em vez de injetar dependência do bot) | 🟢 |
| Auditoria Imutável | `LogTicket` table (Insert-only) associado a cada Update | 🟢 |
| Root Aggregate | Entity `Ticket.ts` liga Contact, User, Whatsapp, Queue e Tags | 🟢 |

## Estado Interno
- **Métricas:** `botRetries`, `lastInteractionBot`, `unreadMessages`. Atualizadas constantemente pelos webhooks de chat, fundamentais para travar bot ou notificar o humano.

## Observabilidade
- Emissão de sockets fragmentados: `[tenantId]:ticket`, `[tenantId]:ticketList`, `[tenantId]:notification`.

## Riscos e Lacunas
- 🟡 Qual o impacto na listagem de tickets se houver 50 mil tickets no status "closed"? A query do `ListTicketsService` tem paginação para "closed", ou o front-end traz todos de uma vez se não paginar corretamente?
- 🔴 Como é feito o lock de concorrência se dois atendentes clicarem em "Aceitar" no mesmo instante? O código original parece não ter Pessimistic Lock na leitura (`UpdateTicketService`).
