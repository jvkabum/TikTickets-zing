---
slug: multi-tenancy
category: architecture
generatedAt: 2026-01-23T15:45:00.000Z
relevantFiles:
  - backend\src\middleware\isAuth.ts
  - backend\src\models\Tenant.ts
  - backend\src\services\TicketServices\ListTicketsService.ts
---

# Como o sistema isola os dados entre diferentes empresas (Tenants)?

## Multi-Tenancy

O TikTickets-zing utiliza uma estratégia de isolamento por coluna (`tenantId`) em um banco de dados compartilhado.

### Detalhes de Implementação

- **Símbolo de Autenticação**: `isAuth` - Middleware que extrai o token e injeta o `tenantId` no objeto `req.user`.
- **Símbolo de Modelo**: `Tenant` - Modelo central que representa a empresa no banco de dados.
- **Símbolo de Filtro**: `tenantId` - Coluna obrigatória em tabelas como `Tickets`, `Messages` e `Contacts`.
- **Símbolo de Serviço**: `ListTicketsService` - Exemplo de serviço que aplica obrigatoriamente o filtro de `tenantId` em todas as queries SQL.
