# Usuários, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Módulo `Tenants` e `Queues` já mapeados e criados.

## Tarefas

- [ ] T-01, CRUD Base e Paginação
  - Origem no legado: `backend/src/controllers/UserController.ts`
  - Critério de pronto: Endpoint de listagem que retorne os dados limpos sem o Hash das senhas e contemple os metadados de paginação (offset/limit).
  - Confiança: 🟢

- [ ] T-02, Validador Centralizado de Cotas
  - Origem no legado: `backend/src/controllers/UserController.ts` (store)
  - Critério de pronto: Lógica que avalie as tabelas globais e a entidade Tenant de forma hard-coded impedindo um Insert nocivo ao licenciamento da plataforma.
  - Confiança: 🟢

- [ ] T-03, Serviço de Remoção Segura (`DeleteUserService`)
  - Origem no legado: `backend/src/services/UserServices/DeleteUserService.ts`
  - Critério de pronto: Transação que ao invés de lançar erro fatal, sequestre os Tickets pendentes atrelados ao usuário alvo, modifique seus responsáveis/filas e só então conclua a exclusão do cadastro.
  - Confiança: 🟢

- [ ] T-04, Emissão de Mutação Socket
  - Origem no legado: `backend/src/controllers/UserController.ts`
  - Critério de pronto: Após Create/Update/Delete de Usuário, deve existir linha com `io.to([tenantId]:user).emit('update')`.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar deleção de um usuário virgem (sem tickets) e validar êxito.
- [ ] TT-02, Testar deleção de um usuário lotado de tickets abertos e avaliar o comportamento resultante dos dados da tabela `Tickets`.

## Ordem Sugerida
1. T-01 e T-04
2. T-02 e T-03 (as regras mais complexas de negócio acoplado)

## Lacunas Pendentes (🔴)
- Esclarecer o direcionamento de Fallback dos tickets órfãos no processo de exclusão.
