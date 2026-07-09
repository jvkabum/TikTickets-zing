# Empresas (Tenants), Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface
Endpoints de controle e edição das configurações da empresa/tenant.

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/admin/tenants` (AdminController.indexTenants) | `[query params]` | `Tenant[]` | 200, 403 |
| POST | `/admin/tenants` (AdminController.createTenant) | `name`, `status`, `maxUsers`, `maxConnections` | `Tenant` | 201, 400 |
| PUT | `/admin/tenants/:id` (AdminController.updateTenant) | `TenantUpdatePayload` | `Tenant` | 200, 404 |
| DELETE | `/admin/tenants/:id` (AdminController.deleteTenant) | `tenantId` | `204 No Content` | 204, 400 |
| PUT | `/tenants/business-hours` (TenantController.updateBusinessHours) | `businessHours` (array formatado) | `Tenant` | 200, 400 |
| PUT | `/tenants/message-business-hours` (TenantController.updateMessageBusinessHours) | `messageBusinessHours` (string) | `Tenant` | 200, 400 |

## Fluxo Principal
1. Para gerenciar tenants, o sistema utiliza o `AdminController` que verifica previamente se a sessão ativa pertence a um `profile === "super-admin"`.
2. As cotas base (`maxUsers`, `maxConnections`) são fixadas no BD na entidade do Tenant no momento da criação ou edição pelo painel admin.
3. Para parametrizar horários de expediente, os operadores do Tenant enviam o array via `TenantController.updateBusinessHours`.
4. O esquema de Yup valida estritamente a máscara "HH:mm" utilizando o `date-fns::isMatch` internamente antes de persistir o dado.

## Fluxos Alternativos
- **Horário Inválido:** Caso o JSON do payload de Business Hours contenha formato fora de `HH:mm`, a requisição falha prematuramente com `400 Bad Request` antes de bater no banco.
- **Deleção Bloqueada:** Regras em cascata ou travas de FK podem bloquear o `deleteTenant` caso a empresa ainda tenha relacionamentos vitais vinculados (como usuários ou conexões ativas).

## Dependências
- **Validação Yup**, valida formatos estritos de dados (Horários).
- **Date-fns**, acoplado na validação para atestar que os dias da semana e horários submetidos representam temporalidades reais.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| businessHours no formato nativo JSONB do Postgres | Descrição da arquitetura de dados | 🟢 |
| Rotas de gerenciamento global divididas no prefixo `/admin` | `AdminController` | 🟢 |

## Estado Interno
- O Tenant dita todo o particionamento do sistema. Em praticamente todas as requisições das outras features, um middleware extrairá a informação da sessão do usuário logado injetando a cláusula `WHERE tenantId = ?` nas queries do ORM.

## Observabilidade
Sem evidências capturadas no código legado sobre telemetria ou loggings específicos de alteração do Tenant.

## Riscos e Lacunas
- 🔴 Não está claro na documentação extraída se o "deleteTenant" implementa "Soft Delete" (arquiva os dados e invalida o login) ou "Hard Delete" (apaga recursivamente o banco). Padrões de SaaS raramente usam Hard Delete pelo risco atrelado a faturamento.
- 🟡 Modificar o `maxConnections` ativamente desconecta aparelhos do cliente em tempo real ou só bloqueia novas inserções? O código não especificou o gatilho reativo disso.
