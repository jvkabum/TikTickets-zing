# ADR 001: Isolamento Multi-Tenant por Coluna (Shared Schema)

**Status:** 🟢 Confirmado Através do Código
**Data:** 2026-07-09

## Contexto
O projeto é um SaaS B2B onde várias organizações (Tenants) operam em um único ambiente hospedado, requerendo segregação rigorosa de dados de configurações, tickets, usuários e campanhas.

## Decisão
A arquitetura escolhida foi **Shared Database, Shared Schema**. Todas as tabelas sensíveis a organização receberam uma Foreign Key `tenantId`. O Sequelize foi encarregado de adicionar implicitamente a cláusula `WHERE tenantId = ?` através da captura de contextos ou validação nos Services/Controllers.

## Alternativas consideradas
- *Database per Tenant*: Segurança maior, mas custos de infraestrutura escalam absurdamente rápido.
- *Schema per Tenant*: Complexidade nas queries e migrações.

## Consequências
- **Positivas:** Facilidade em aplicar atualizações de banco de dados (migrations únicas). Custos de hospedagem minimizados por não precisar de uma instância de BD por cliente.
- **Negativas:** Alto risco de "data leak" caso um desenvolvedor esqueça de incluir a cláusula `tenantId` em queries customizadas. O módulo `settings` apresentou vulnerabilidades (ex: query bruta no `daysToClose` que bypassa o controle).
