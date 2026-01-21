# Banco de Dados e Modelos

O TikTickets-zing utiliza **PostgreSQL** com o ORM **Sequelize** (através de `sequelize-typescript`).

## Modelos Principais

### Tenants (Empresas)
A base do Multi-Tenancy. Cada empresa tem seu próprio registro aqui.
- Atributos: `id`, `name`, `status`.

### Users
Usuários do sistema (Agentes/Admins).
- Atributos: `id`, `name`, `email`, `password`, `tenantId`.

### WhatsApps (Canais)
Configurações das instâncias de WhatsApp.
- Atributos: `id`, `name`, `status`, `tenantId`, `session` (path da sessão).

### Contacts
Contatos/Clientes sincronizados.
- Atributos: `id`, `name`, `number`, `tenantId`.

### Tickets
Gestão de atendimentos.
- Atributos: `id`, `status`, `userId`, `contactId`, `tenantId`.

### Messages
Mensagens trocadas.
- Atributos: `id`, `body`, `fromMe`, `ticketId`, `tenantId`.

## Convenções de Migração
- Sempre use migrations para alterar a estrutura do banco (`backend/src/database/migrations`).
- O campo `tenantId` deve ser indexado para performance.
- Use `foreignKey` para manter a integridade referencial.
