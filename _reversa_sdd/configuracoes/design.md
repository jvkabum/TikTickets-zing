# Configurações, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Socket.io Broadcast | Mudança via REST levanta trigger em `tenantId:settings` `action update` | 🟢 |
| Dicionário Burro (String to String) | Campo genérico que deixa conversão para a camada consumidora (ex: bool/number) | 🟢 |

## Riscos e Lacunas
- 🔴 O Bypass do Tenant na Raw SQL query `SELECT value FROM public."Settings" WHERE key = 'daysToClose'` expõe a aplicação a um colapso caso existam mais de 2 Tenants cadastrados. O SQL precisa usar `AND "tenantId" = X`.
