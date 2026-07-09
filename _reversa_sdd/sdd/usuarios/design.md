# Usuários (Users), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/users` | `QueryParams (search, page)` | `{ users, count, hasMore }` | 200, 401 |
| POST | `/users` | `UserCreate` | `User` | 201, 400, 401 |
| PUT | `/users/:id` | `UserUpdate` | `User` | 200, 404, 401 |
| DELETE | `/users/:id` | `id: string` | `200 OK` | 200, 400, 404 |
| PUT | `/users/:id/configs`| `JSON Configs` | `User` | 200, 400 |

## Fluxo Principal
1. **Cadastro com Associação em Filas:** A rota `POST /users` no `UserController` recebe os dados (nome, e-mail, senha, `queueIds`).
2. Verifica Limites contra `Tenant.maxUsers`.
3. Insere a master-record na tabela `Users` e faz bulk-insert na pivot `UsersQueues` baseado no array recebido.
4. Emite um WebSocket trigger de inserção e retorna sucesso.

## Fluxos Alternativos
- **Signup Público (Auto-Cadastro):** Se `userCreation` do Tenant estiver habilitado, a rota de `POST` pula a validação de token (não precisa estar logado) permitindo cadastro de conta master.
- **Deleção Segura:** `DeleteUserService` captura os tickets associados. Se tiver aberto, transfere os tickets em aberto para a fila sem dono ou para outro usuário apontado, em seguida chama o `.destroy()`.

## Dependências
- `Socket.io`: Sincroniza a lista de usuários para outros administradores que estejam no painel de gerência na hora do CRUD.
- `Bcrypt`: Proteção inata durante o INSERT ou UPDATE.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Bloqueio Lógico de Exclusão | `DeleteUserService` e `UpdateDeletedUserOpenTicketsStatus` | 🟢 |
| Coluna Coringa "configs" | O tipo `JSON` em banco PostgreSQL | 🟢 |

## Estado Interno
- **Configs:** Cada usuário é dono do seu layout e preferências visuais. O backend só armazena o JSON, que é renderizado pelo Vue.js 3 via Pinia.

## Observabilidade
- Emissão de canal socket `[tenantId]:user` nas ações (create, update, delete).

## Riscos e Lacunas
- 🟡 O `DeleteUserService` pode demorar muito se o operador excluído possuir milhares de tickets "abertos" precisando sofrer cascata no helper. Isso pode causar timeout na API caso o callcenter seja volumoso.
