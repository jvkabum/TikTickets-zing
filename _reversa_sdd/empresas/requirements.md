# Empresas (Tenants)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia as empresas clientes do SaaS (Tenants), controlando as cotas de consumo, isolamento de banco de dados por FK (`tenantId`) e configurações de expediente (horários de funcionamento e mensagem de ausência).

## Responsabilidades
- Criar, ler, atualizar e excluir Tenants pelo perfil Superadmin.
- Limitar o acesso aos serviços do sistema baseado no `status` do Tenant.
- Impor limites de uso configuráveis (cotas `maxUsers`, `maxConnections`).
- Configurar dias da semana e os respectivos turnos de horários de funcionamento (`businessHours`).
- Customizar a mensagem automática de Fora de Expediente.

## Regras de Negócio
- Somente perfis `super-admin` podem realizar o CRUD base da entidade Tenant 🟢
- O status `active` é necessário para que qualquer usuário pertencente ao Tenant faça login no sistema 🟢
- O formato de horário na tabela de expediente deve seguir restritamente `HH:mm` 🟢
- Isolamento de Dados: Todo módulo no sistema que contenha a chave estrangeira `tenantId` deve operar blindado dos demais Tenants 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD de Tenants | Must | Administradores mestres (super-admin) devem conseguir cadastrar novas empresas, definir limite de usuários e limite de conexões. |
| RF-02 | Configurar Horários Comerciais | Must | Os administradores de cada Tenant devem poder definir arrays de horas (hr1 até hr4) para cada dia da semana. |
| RF-03 | Mensagem de Fora do Expediente | Should | O tenant pode definir uma resposta textual customizada para clientes que entrarem em contato fora da janela de operação. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Arquitetura | Banco de Dados Multi-Tenant Shared Schema | Isolamento por FK em praticamente todos os relacionamentos | 🟢 |
| Segurança | Validação Customizada de Input | Yup + date-fns para validar payloads complexos como "businessHours" | 🟢 |
| Desempenho | Armazenamento de Expediente em JSONB | Coluna no Postgres, permitindo flexibilidade | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado que o usuário tem permissões de super-admin
Quando solicitar a criação de um novo Tenant passando nome e cotas (maxUsers/maxConnections)
Então a empresa deve ser salva e devolvida com status padrão 'active'

Dado que o administrador de um Tenant deseja configurar o atendimento
Quando salvar a configuração de dias da semana e enviar um horário no formato incorreto (ex: "25:00")
Então o sistema deve rejeitar o payload com erro de validação (Yup)

Dado que um Tenant teve seu status alterado para inativo por um super-admin
Quando um de seus usuários tentar realizar login no sistema
Então o sistema deve bloquear o acesso informando conta suspensa
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Isolamento Multi-Tenant via FK | Must | A espinha dorsal arquitetural de um produto SaaS compartilhado. |
| Controle de Status Inativo | Must | Permite suspensão de clientes inadimplentes ou bloqueados. |
| Configuração de Business Hours | Must | Necessário para evitar chamados e SLA furados de madrugada. |
| Cotas de Usuários e Conexões | Should | Essencial para pacotes de precificação (Pricing Tiers) do SaaS. |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/AdminController.ts` | CRUD de Tenants global | 🟢 |
| `backend/src/controllers/TenantController.ts` | `updateBusinessHours`, `updateMessageBusinessHours` | 🟢 |
