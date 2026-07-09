# Filas (Queues), Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/queue` | `SearchParam` | `Queue[]` | 200, 401 |
| POST | `/queue` | `queue`, `isActive` | `Queue` | 201, 400 |
| PUT | `/queue/:queueId` | `QueueUpdate` | `Queue` | 200, 404 |
| DELETE | `/queue/:queueId` | `queueId` na URL | `200 OK` (ou erro tratado 404) | 200, 404 |

## Fluxo Principal
1. Para exclusão, o admin envia o VERBO Delete.
2. O ORM invoca `.destroy()`. Se houver tickets atrelados, o BD dispara o erro `SequelizeForeignKeyConstraintError`. O controller engole a exceção (catch) e emite uma resposta semântica pro front.
3. A criação invoca o motor nativo Yup exigindo que a propriedade com o nome da fila se chame literalmente `queue`.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Uso de Constraint de BD em vez de Contagem | `DeleteQueueService` usa erro direto de FK | 🟢 |

## Riscos e Lacunas
- 🟡 Qual a destinação dos operadores na tabela N:M quando a fila é inativada/excluída? O comportamento de limpeza não foi captado no sumário.
