# Tenants (Empresas), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Módulo Base (Express) e ORM Sequelize configurados.
- [ ] Entidade `Tenant` materializada no banco com coluna JSONB para expedientes.

## Tarefas

- [ ] T-01, Implementar Entidade Tenant e schema JSONB
  - Origem no legado: `backend/src/models/Tenant.ts`
  - Critério de pronto: Tabela criada com `maxUsers`, `maxConnections`, `status` (default: 'active'), e `businessHours`.
  - Confiança: 🟢

- [ ] T-02, Implementar CRUD Base de Tenants
  - Origem no legado: `backend/src/controllers/AdminController.ts`
  - Critério de pronto: Endpoints `GET`, `POST`, `PUT`, `DELETE` acessíveis APENAS pelo perfil de superadmin.
  - Confiança: 🟢

- [ ] T-03, Implementar Atualizador de Expediente e Validação Yup
  - Origem no legado: `backend/src/controllers/TenantController.ts`
  - Critério de pronto: Endpoint que atualiza `businessHours`, rejeitando formatos que não sejam "HH:mm".
  - Confiança: 🟢

- [ ] T-04, Acoplar lógica de Cotas (Limites)
  - Origem no legado: Vários serviços, como `CreateUserService`
  - Critério de pronto: Criar Helpers ou Middlewares reutilizáveis que comparem o limite e impeçam inserções além da cota configurada no Tenant.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar a inserção de strings mal-formatadas em `businessHours` ("24:60", "28:00") certificando-se de que o Yup bloqueie.
- [ ] TT-02, Forçar a criação de conexões WhatsApp acima de `maxConnections` simulando o trigger da recusa.

## Ordem Sugerida
1. T-01: Migrations e Models.
2. T-02: Gestão Básica pelo Superadmin.
3. T-03: Refinamento das horas e validadores (para que o frontend possa desenhar a tela de horários).
4. T-04: Implementação cruzada em outros módulos.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica pendente.
