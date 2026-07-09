# Agendamentos, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Poller Cron Job | Um script autônomo roda a cada N segundos extraindo da base onde `sendAt <= NOW()` | 🟢 |

## Fluxos Alternativos
- Como todo job em Batch, se a instância Node.js for reiniciada as mensagens não se perdem pois a query é `LESS THAN OR EQUAL`. Assim que iniciar, ele dispara o que estiver atrasado.
