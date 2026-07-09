# Estatísticas (Dashboard), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `Ticket`, `LogTicket` e `Queue` populadas e funcionais.
- [ ] Middlewares de Data/Timezone corretamente isolados no Express.

## Tarefas

- [ ] T-01, Implementar Indicadores Macros (Cards)
  - Origem no legado: `GetDashTicketsIndicatorsService`
  - Critério de pronto: Endpoint `GET /dash/tickets-indicators` retornando a soma bruta de tickets nos 3 status vitais, filtrados obrigatoriamente por `tenantId` e período.
  - Confiança: 🟢

- [ ] T-02, Agrupamento Evolutivo no Tempo (Gráficos de Linha)
  - Origem no legado: `GetDashTicketsEvolutionByPeriodService`
  - Critério de pronto: Query retornando dados agregados por Dia (`YYYY-MM-DD`) para plotar a curva de chamados ao longo do tempo selecionado.
  - Confiança: 🟢

- [ ] T-03, Agrupamento por Filas e Atendentes (Gráficos de Pizza/Barra)
  - Origem no legado: `GetDashTicketsQueueService` e correlatos.
  - Critério de pronto: Retornar agrupamentos simples listando Onde a carga de atendimento está concentrada (qual fila e qual operador fechou mais tickets).
  - Confiança: 🟢

- [ ] T-04, Cálculo Complexo de TMA e TME
  - Origem no legado: Cálculos em controllers de estatísticas e painel detalhado de usuários.
  - Critério de pronto: Lógica imune a UTC que forneça, em minutos, o Tempo Médio de Espera e Tempo Médio de Atendimento por operador, tratando os tickets cancelados/sem resposta.
  - Confiança: 🟡

## Tarefas de Teste

- [ ] TT-01, Filtro de Datas Seguro: Enviar um `date_from` maior que `date_to`. O sistema deve rejeitar ou retornar 0 para evitar queries reversas onerosas.
- [ ] TT-02, Garantia de Multi-tenant Analítica: Buscar dados e conferir no log do Sequelize se a string `WHERE "tenantId" = X` foi realmente acoplada a *todas* as subqueries.

## Ordem Sugerida
1. T-01: Mais fácil e de maior impacto visual.
2. T-02 e T-03: Queries analíticas padrão usando `group by`.
3. T-04: Exigirá refatorações matemáticas e possivelmente testes de mesa com horários quebrados para validar o cálculo de SLA.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica pendente. Módulo Read-Only isolado.
