# Autenticação, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Interface
Endpoints de controle de sessão.

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| POST | `/login` (SessionController.store) | `email`, `password` | `{ user, token, refreshToken, usuariosOnline }` | 200, 401 |
| POST | `/refresh` (SessionController.update) | Cookie HTTP-only `jrt` | `{ token, refreshToken }` | 200, 401 |
| DELETE | `/logout` (SessionController.logout) | `userId` | `204 No Content` | 204, 400 |

## Fluxo Principal
1. O usuário submete `email` e `password` no `/login`.
2. O controller (`SessionController.store`) busca o usuário pelo e-mail e verifica a senha usando o helper de hash `Bcrypt`.
3. Verifica se o tenant (empresa) do usuário está com `status === "active"`. Se não, rejeita com 401.
4. Gera um Access Token (JWT curto) e um Refresh Token (JWT longo).
5. Retorna os tokens e o objeto `user`, enviando um evento via WebSocket `[tenantId]:users` com a notificação online.

## Fluxos Alternativos
- **Tenant Suspenso:** Se o usuário tentar logar e a empresa dele foi bloqueada pelo admin (`status !== "active"`), o acesso é bloqueado na rota de login e de refresh.
- **Sessão Expirada:** Ao expirar o Access Token, o front-end consome a rota de refresh passando o cookie HTTP-only `jrt` contendo o refresh token para re-emissão da sessão.

## Dependências
- **Banco de Dados (User Model)**, valida credenciais e senhas hashadas.
- **Tenant Model**, valida o status da empresa do usuário.
- **WebSocket (Socket.io)**, emite atualizações de presença do usuário em tempo real.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Criptografia de senhas usando Bcrypt no hook BeforeCreate/Update do User | `models/User.ts` (inferido via analysis) | 🟢 |
| Renovação de sessão usa Cookie HTTP-only | `SessionController.update` | 🟢 |
| Atualização de estado online é feita ativamente no login e logout via Socket | `SessionController.store/logout` | 🟢 |

## Estado Interno
O módulo manipula o estado do usuário alterando a propriedade booleana `isOnline` e armazenando o timestamp em `lastLogout` durante a desconexão.

## Observabilidade
Sem métricas customizadas inferidas até o momento. Depende puramente dos status code HTTP para identificar falhas (ex: 401 Unauthorized para senhas incorretas).

## Riscos e Lacunas
- 🔴 É possível que um usuário faça múltiplos logins na mesma conta em dispositivos diferentes? O código extraído não menciona limitação de concorrência ou invalidação por device.
- 🟡 A revogação manual de todos os tokens não está evidente nas assinaturas capturadas (ex: mudança de senha).
