# Empresas (Tenants), Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Model `Tenant` criado e migrado no banco de dados.
- [ ] Middlewares de autenticação que extraem a variável `req.user.tenantId` implementados.
- [ ] Roles baseados em perfil (RBAC) suportando o papel de `super-admin`.

## Tarefas

> Cada tarefa referencia o arquivo do legado de onde o comportamento foi extraído.

- [ ] T-01, Implementar CRUD global de Tenants (Super Admin)
  - Origem no legado: `backend/src/controllers/AdminController.ts`
  - Critério de pronto: Apenas administradores do SaaS (super-admin) podem criar novos clientes preenchendo os limites `maxUsers` e `maxConnections`. A deleção deve ser modelada de forma segura (verificar lacuna de Soft Delete).
  - Confiança: 🟢

- [ ] T-02, Atualização de Expediente (`businessHours`)
  - Origem no legado: `backend/src/controllers/TenantController.ts`
  - Critério de pronto: Rota que recebe o array de expedientes, utiliza a lib `Yup` atrelada a `date-fns` para chancelar o formato da hora (HH:mm) e atualiza o dado em formato nativo JSONB no banco de dados.
  - Confiança: 🟢

- [ ] T-03, Atualização de Mensagem de Ausência
  - Origem no legado: `backend/src/controllers/TenantController.ts`
  - Critério de pronto: Endpoint `updateMessageBusinessHours` criado recebendo e validando uma string que será anexada à model.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar rejeição imediata da validação do Yup enviando payload com data mal formatada na rota de business-hours.
- [ ] TT-02, Garantir que um usuário de tenant `A` não consegue alterar, ver ou listar tenants (retornando HTTP 403 Forbidden para papel normal).
- [ ] TT-03, Teste de login (da Unit de Autenticação) confirmando que tenants com status inativos impedem as sessões de forma bem-sucedida.

## Tarefas de Migração de Dados (se aplicável)

- [ ] TM-01, Consolidar e migrar o formato de `businessHours` do sistema legado. Em caso de banco diferente do Postgres (onde o JSONB será convertido), modelar adequadamente via Data Types apropriados (ex: JSON no MySQL/SQL Server).

## Ordem Sugerida
1. T-01, sem a existência das Empresas, o resto do SaaS (todas as demais 15 units) perderão as chaves estrangeiras e não conseguirão ser inicializadas. Esta é a funcionalidade Core estrutural.
2. T-02 e T-03.

## Lacunas Pendentes (🔴)
- Definir regra mandatória sobre a exclusão da empresa (Hard Delete x Soft Delete).
- Definir o comportamento do sistema para canais e conexões abertas se uma empresa atingir o "maxConnections" ou tiver sua quota subitamente reduzida pelo SuperAdmin.
