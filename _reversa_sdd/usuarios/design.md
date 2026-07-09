# Usuários, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface
Endpoints de controle e edição de operadores.

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/users` (UserController.index) | Paginator Params | `User[]` | 200, 401 |
| POST | `/users` (UserController.store) | `UserCreatePayload` | `User` | 201, 400 |
| PUT | `/users/:id` (UserController.update) | `UserUpdatePayload` | `User` | 200, 404 |
| DELETE | `/users/:id` (UserController.remove) | `userId` | `200 OK` | 200, 400 |

## Fluxo Principal
1. O administrador aciona o endpoint `/users` para criar o operador.
2. O sistema extrai o `tenantId` da sessão logada.
3. Consultas agregadas contam os usuários atuais contra a regra `.env` (USER_LIMIT) e do Tenant (`Tenant.maxUsers`).
4. Se aprovado, persiste na base com as senhas já sob o Hook de encriptação Bcrypt do model.
5. As filas designadas são salvas na tabela de interseção `UsersQueues`.

## Fluxos Alternativos
- **Fallback para Autoregistro Público:** Se a variável global de liberação estiver ativada, a rota `/users` pode ser alvejada sem Bearer Token, atuando como Landing Page de um novo lead contratando o SaaS.
- **Limpeza de Tickets Órfãos:** Durante o fluxo de exclusão de usuário, a rota injeta o middleware de negócios `UpdateDeletedUserOpenTicketsStatus` no banco, transferindo os relacionamentos atrelados para que as transações permaneçam íntegras.

## Dependências
- **Tickets Service**, invocado na deleção para salvaguarda.
- **Queues Service**, para associar a pivot N:M do relacionamento Usuário <> Departamento.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Utilização de tabela pivô `UsersQueues` explícita | Modelo de dados N:M | 🟢 |
| Atualizações refletem via Socket.io | Emissão de evento de mutação | 🟢 |
| Helper especializado para deleção `DeleteUserService` isolado do Controller | Padrão arquitetural (Solid/Single Responsibility parcial) | 🟢 |

## Estado Interno
- O armazenamento flexível no campo genérico `configs` (JSON) que possibilita expansão de regras pontuais (ex: notificação ligada, auto-aceitar tickets) sem alteração no esquema.

## Observabilidade
Sem evidências capturadas no código.

## Riscos e Lacunas
- 🟡 Qual a destinação exata do ticket de um operador excluído? Ele volta para "pending" (espera) ou o sistema escolhe aleatoriamente outro operador? Pelo código extraído, diz que realoca ou fecha, mas a regra de triagem não está clara.
