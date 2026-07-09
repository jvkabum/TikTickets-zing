# Estatísticas (Dashboard), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/dash/tickets-indicators` | `QueryParams (startDate, endDate)` | `{ pending, open, closed }` | 200, 401 |
| GET | `/dash/tickets-evolution-channels` | `QueryParams` | `{ date, qtd, channel }[]` | 200, 401 |
| GET | `/dash/tickets-evolution-by-period` | `QueryParams` | `{ date, qtd }[]` | 200, 401 |
| GET | `/dash/tickets-per-users-detail` | `QueryParams` | `{ userId, name, count, tma, tme }[]` | 200, 401 |
| GET | `/dash/tickets-queue` | `QueryParams` | `{ queueId, name, count }[]` | 200, 401 |

## Fluxo Principal
1. **Load do Painel:** O front-end Vue, ao entrar na rota de Dashboard, faz requisições simultâneas para os endpoints de agregamento.
2. **Controller Engine:** `DashController` invoca serviços utilitários independentes (`GetDashTicketsIndicatorsService`, `GetDashTicketsQueueService`, etc).
3. **Query Builder:** Cada serviço utiliza as capacidades do Sequelize para estruturar SQL equivalente a: `SELECT count(id), queueId FROM "Tickets" WHERE tenantId = X AND createdAt >= Y GROUP BY queueId`.
4. **Transformação de Dados:** O Node processa o array resultante e o converte para formatos exigidos pela biblioteca de gráficos do frontend (ex: Chart.js / ApexCharts).

## Fluxos Alternativos
- N/A. Operações puramente de leitura (Read-Only Analytics).

## Dependências
- `PostgreSQL`: O peso pesado do cálculo é repassado ao banco relacional.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Segmentação de Endpoints | Existem endpoints isolados por "tipo de gráfico", evitando um super-endpoint de relatório pesadíssimo que travaria de uma vez | 🟢 |
| Cálculo de Tempo no Banco vs Node | Métricas de TMA são frequentemente resolvidas subtraindo datas (`closedAt` - `startedAttendanceAt`) diretamente via `sequelize.fn` ou pós-processadas no Node com biblioteca `date-fns`. | 🟢 |

## Estado Interno
- Stateless. Totalmente derivado do dado estático já persistido pelos módulos de Tickets.

## Observabilidade
- A lentidão dessas rotas (ex: requisições demorando > 2s) costuma ser o primeiro indicador de que faltam índices na tabela de `Tickets` ou que o Tenant atingiu um volume que demanda Data Warehouse (ClickHouse, BigQuery).

## Riscos e Lacunas
- 🔴 É estritamente recomendado usar o operador `EXTRACT(EPOCH FROM (col2 - col1))` se a subtração for no banco, ou fazer a matemática em Node. Falhas no legado (ex: TME marcando números absurdos) ocorrem porque o fuso-horário (Timezone UTC vs America/Sao_Paulo) bagunça as datas salvas vs as enviadas no filtro. Sugerimos forçar Timezone explícito na querystring.
