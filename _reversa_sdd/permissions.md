# Matriz de Permissões (RBAC)

> 🟡 INFERIDO

O sistema usa um controle de acesso baseado em papéis (Role-Based Access Control) armazenado no campo `profile` da tabela `User`.

## Papéis Identificados

- **User (`user`)**: O operador de atendimento padrão. Focado na interface de chat.
- **Admin (`admin`)**: O gestor daquele Tenant (empresa). Configura filas, campanhas, regras e cadastra usuários da própria empresa.
- **Super Admin (`super-admin`)**: Acesso master do SaaS. Gere as empresas cadastradas no banco de dados e limites gerais.

## Matriz de Acesso

| Funcionalidade / Recurso | `user` | `admin` | `super-admin` |
|--------------------------|--------|---------|---------------|
| **Tickets (Chat)** | Apenas filas designadas | Todas da empresa | N/A |
| **Contatos** | Leitura / Criação | CRUD completo | N/A |
| **Respostas Rápidas** | Leitura / Criação própria | Gestão do Tenant | N/A |
| **Filas (`queues`)** | Leitura | CRUD completo | N/A |
| **Canais / Conexões** | Sem Acesso | CRUD (limitado à cota) | N/A |
| **Campanhas** | Sem Acesso | CRUD completo | N/A |
| **ChatFlows / Automação**| Sem Acesso | CRUD completo | N/A |
| **Usuários do Tenant** | Edição Própria (`configs`) | CRUD do Tenant | N/A |
| **Dashboards (Stats)** | Restrito aos próprios tickets | Visão global do Tenant | N/A |
| **Tenants (Empresas)** | Sem Acesso | Edição própria | CRUD Completo |
