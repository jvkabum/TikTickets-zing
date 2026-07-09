# Estatísticas (Dashboards)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Motor analítico do sistema. Coleta toda a massa de metadados transacionais (logs, contadores de mensagens, tempos) e expõe relatórios agregados vitais para o monitoramento da qualidade do call center (TMA, TME).

## Responsabilidades
- Retornar relatórios segmentados de tickets, quantidade de mensagens trafegadas, evolução por dia.
- Diferenciar os dados visíveis conforme a patente do solicitante (Admin vê geral, Operador vê a própria performance).
- Rastrear individualmente os tempos de passagem nas mãos de múltiplos atendentes em um mesmo ticket para não sujar a métrica de tempo-médio do último operador.

## Regras de Negócio
- A query de `DashTicketsAndTimes` avalia o perfil do usuário: Se `admin`, omite filtros; Se `user`, adiciona estritamente `userId = autenticado` 🟢
- O TMA (Tempo Médio de Atendimento) não é o tempo de vida total do ticket, e sim a soma do tempo dentro do `LogTicket` no status correspondente ao usuário ativo 🟢
- Avaliações consolidadas não são baseadas no cache de aplicação, os dados trafegam direto do banco `AGE()` para não causar latência na RAM 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/StatisticsController.ts` | Dashboards Globais | 🟢 |
| `backend/src/services/Statistics/DashTicketsAndTimes.ts` | Agregação Bruta de Performance | 🟢 |
