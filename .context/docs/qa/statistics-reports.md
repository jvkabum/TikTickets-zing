---
slug: statistics-reports
category: features
generatedAt: 2026-01-23T16:00:00.000Z
relevantFiles:
  - backend\src\services\Statistics\DashTicketsAndTimes.ts
  - backend\src\services\Statistics\StatisticsPerUsers.ts
  - backend\src\services\Statistics\DashTicketsEvolutionByPeriod.ts
---

# Como são geradas as estatísticas e relatórios de desempenho?

## Estatísticas e Dashboards

O sistema processa os logs de tickets e mensagens para extrair métricas de produtividade e tempo de resposta.

### Detalhes de Implementação

- **Métricas de Tempo**: O `DashTicketsAndTimes` calcula o tempo médio de espera (desde o `pending` até o `open`) e o tempo médio de atendimento.
- **Performance por Agente**: O `StatisticsPerUsers` consolida a quantidade de tickets resolvidos e mensagens enviadas por cada atendente dentro de um `tenantId`.
- **Evolução Temporária**: O `DashTicketsEvolutionByPeriod` gera dados agregados para os gráficos de linha do dashboard, permitindo visualizar picos de atendimento por dia/hora.
- **Relatório de Contatos**: O `ContactsReportService` permite exportar a base de clientes com filtros de data e tags para uso em marketing externo.
