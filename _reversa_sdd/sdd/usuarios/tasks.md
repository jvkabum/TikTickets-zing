# Usuários (Users), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidades `User`, `Tenant`, e `Queue` no banco de dados.
- [ ] Helpers/Hooks de hash via Bcrypt (feito em Auth).

## Tarefas

- [ ] T-01, Implementar Entidade associativa `UsersQueues`
  - Origem no legado: Models (Relacionamento N:M)
  - Critério de pronto: Tabela pivot criada com constraints para `userId` e `queueId`.
  - Confiança: 🟢

- [ ] T-02, CRUD de Paginação (Listagem)
  - Origem no legado: `backend/src/services/UserServices/ListUsersService.ts`
  - Critério de pronto: Rota `GET /users` capaz de lidar com `pageNumber` e filtro de texto `searchParam`, retornando paginação de banco (LIMIT/OFFSET).
  - Confiança: 🟢

- [ ] T-03, Criação com Dupla Checagem de Cotas
  - Origem no legado: `backend/src/services/UserServices/CreateUserService.ts`
  - Critério de pronto: Rota de criação bloqueando o `.create()` caso o tenant atual exceda limites, preenchendo as filas solicitadas na tabela associativa.
  - Confiança: 🟢

- [ ] T-04, Exclusão Segura e Redistribuição
  - Origem no legado: `backend/src/services/UserServices/DeleteUserService.ts`
  - Critério de pronto: Se o usuário a ser deletado tiver Tickets com status = 'open', o sistema previne a deleção brusca ou repassa os tickets via helper genérico.
  - Confiança: 🟢

- [ ] T-05, Rota Genérica para Configurações Pessoais
  - Origem no legado: `backend/src/controllers/UserController.ts`
  - Critério de pronto: Rota `PUT /users/:id/configs` apenas recebendo o JSON e gravando no banco sem validações de shape restritas.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Testar recusa de criação estourando o limite da cota do `.env`.
- [ ] TT-02, Simular exclusão de usuário que tem 10 atendimentos nas costas e verificar a integridade referencial e realocação.

## Ordem Sugerida
1. T-01: Sem as associações, as rotas quebram.
2. T-02: Para alimentar as tabelas no Front-end (Visualização).
3. T-03: Criação básica.
4. T-04: Exclusão com lógicas densas de segurança e integridade de BD.

## Lacunas Pendentes (🔴)
- Avaliar o timeout da consulta de realocação de Tickets se houver alto volume de dados (exclusão de um Atendente Senior com histórico pesado).
