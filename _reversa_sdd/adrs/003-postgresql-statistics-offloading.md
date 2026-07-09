# ADR 003: Delegação de Lógica Analítica ao PostgreSQL

**Status:** 🟢 Confirmado Através do Código
**Data:** 2026-07-09

## Contexto
O Dashboard (`statistics`) precisa agregar Tempo Médio de Atendimento (TMA) e Tempo Médio de Espera (TME) de milhares de `LogTickets` instantaneamente. O ORM puro sobrecarregaria a RAM do Node.js carregando instâncias não usadas.

## Decisão
Abandonar o ORM nas rotas de `statistics` em favor de **Raw SQL Queries** altamente otimizadas e com Injeção de Parâmetros blindada (`replacements`). As funções temporais matemáticas (`AGE()`, `extract(epoch from...)`) e os joins correm puramente no motor do Postgres.

## Alternativas consideradas
- *Agregação em Memória no Node*: Fazer loop de arrays. Levaria a Out of Memory (OOM) fatal em bancos grandes.
- *Camada de Cache Redis para Dashboards*: Adicionaria mais complexidade à invalidação do cache em tempo real.

## Consequências
- **Positivas:** Performance dramática na renderização da Home. Desperdício zero de memória na aplicação.
- **Negativas:** Código fortemente acoplado ao dialeto SQL do PostgreSQL. Dificulta muito uma hipotética migração para MySQL ou NoSQL no futuro, ferindo o princípio do Agnosticismo de Banco.
