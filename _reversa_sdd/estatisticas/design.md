# Estatísticas, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Offloading em DB | Extrai o `AGE()` do postgreSQL para evitar `moment.js` / laços em Node.js | 🟢 |
| Rastreio Granular Histórico | `DashTicketsAndTimes` executa `INNER JOIN LogTickets` com agrupamento para somar milissegundos | 🟢 |

## Fluxos Alternativos
- Não possui fallbacks sistêmicos. Se o DB afunilar por Query Heavy, a requisição sofre timeout pelo controlador de Load Balancer.

## Riscos e Lacunas
- 🔴 Ao invés de views materializadas, a solução em Raw Query pesada atinge diretamente o banco quente do Postgres. Em Tenants grandes, isso trava todo o SaaS (risco de lentidão catastrófica em picos de relatórios no fim de mês).
