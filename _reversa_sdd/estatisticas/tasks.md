# Estatísticas, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Endpoint DashTicketsAndTimes (Filtro Hierárquico)
  - Origem no legado: `backend/src/services/Statistics/DashTicketsAndTimes.ts`
  - Critério de pronto: Endpoint de leitura condicional. Recebendo Admin na extração de perfil da Request, retornar tickets globais. Recebendo Operator, encapsular filtro mandatório no ORM limitando aos tickets de sua posse.
  - Confiança: 🟢

- [ ] T-02, **[Melhoria Ativa]** Views Materializadas / Cache
  - Origem no legado: Risco arquitetural em `StatisticsController`.
  - Critério de pronto: Implementar rotina onde métricas pesadas (Contagem total de mensagens, TMA global do mês) fiquem em cache de Redis em vez de executar o `AGE` SQL de 15 em 15 segundos nas páginas ativas de gestores.
  - Confiança: 🟢
