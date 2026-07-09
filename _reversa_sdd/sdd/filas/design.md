# Filas (Queues), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/queues` | `QueryParams (tenantId)` | `[Queue]` | 200, 401 |
| GET | `/queues/:queueId` | `queueId` | `Queue` | 200, 404, 401 |
| POST | `/queues` | `QueueCreate { queue, schedules, color, greetingMessage }` | `Queue` | 200, 400, 401 |
| PUT | `/queues/:queueId` | `QueueUpdate` | `Queue` | 200, 400, 404 |
| DELETE | `/queues/:queueId` | `queueId` | `200 OK` | 200, 404, 401 |

## Fluxo Principal
1. **Listagem:** O frontend requisita `/queues`. O `QueueController.index` retorna todas as filas atreladas ao `tenantId` do admin logado. Não há paginação complexa pois o volume de departamentos é pequeno (<100).
2. **Criação/Atualização:** Payload validado por Yup (garante formato hex na cor e estrutura do objeto `schedules`).
3. Ao ser inserida/atualizada no Postgres, o backend emite o evento `[tenantId]:queue` notificando todos os WebSockets daquele cliente SaaS para redesenhar a lista de opções nas configurações sem refresh.

## Fluxos Alternativos
- **Exclusão Insegura:** Se a fila for excluída, o comportamento padrão do Sequelize em muitas FKs de Ticket é `SET NULL`. Isso jogaria os tickets da fila excluída para um limbo (sem fila). Em implementações seguras, a API deve bloquear se houver tickets, ou obrigar a transferência massiva, embora o legado possa estar operando no limite desse risco.

## Dependências
- `Socket.io`: Broadcaster das alterações (`queue`).
- Validador `Yup`: Muito estrito quanto aos dados de cor.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Cor em formato Hexadecimal | Controller e Validação UI dependem disso para injetar no CSS inline no Front-end (Vue) | 🟢 |
| Tabela Pivot Automática | A associação `UsersQueues` e `WhatsappQueues` usa as decorators do Sequelize-Typescript implicitamente | 🟢 |

## Estado Interno
- **Schedules:** Mantido como um array JSONB ou texto estruturado na própria tabela de Filas. Sem chave estrangeira separada para expedientes, favorecendo performance de leitura.

## Observabilidade
- Emissão de canal socket `[tenantId]:queue` para actions de CRUD.

## Riscos e Lacunas
- 🔴 Qual a constraint exata (Restrict vs Set Null) aplicada na exclusão da Fila em relação aos Atendimentos (`Tickets`) em andamento? O legado não explicita uma camada de transição segura como faz no usuário. Isso precisará ser polido na implementação (`UpdateDeletedQueueTickets`).
