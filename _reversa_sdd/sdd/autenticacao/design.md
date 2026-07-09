# Autenticação (Auth), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| POST | `/login` (SessionController.store) | `{ email, password }` | `{ user, token, refreshToken, usuariosOnline }` | 200, 401 |
| POST | `/refresh_links` (SessionController.update) | Cookie `jrt` | `{ token, user, refreshToken, empresa }` | 200, 401 |
| DELETE | `/logout` (SessionController.logout) | `Bearer Token` | `200 OK` | 200, 401 |

## Fluxo Principal

1. **Login:** O cliente envia e-mail e senha.
2. O `SessionController` busca o usuário e invoca `CheckPassword` (Bcrypt).
3. Se válido, verifica se o tenant (`tenantId`) associado tem o `status === "active"`.
4. O `createAccessToken` emite um JWT de curta duração.
5. O `createRefreshToken` emite um token longo e salva na versão do token do usuário.
6. O sistema emite via `socket.io` um evento `[tenantId]:users` notificando que o `userId` está `isOnline = true`.
7. Retorna JSON com os tokens e injeta cookie `jrt` HTTP-only.

## Fluxos Alternativos
- **Tenant Inativo:** Se a empresa associada ao login estiver desativada/suspensa, o login falha com 401 Unauthorized, mesmo que a senha esteja correta.
- **Refresh Flow:** O Front-end bate no `/refresh` silenciosamente passando o Cookie `jrt`. O back-end lê, renova a validade no banco e devolve novo JWT.

## Dependências
- `Socket.io`: Usado para broadcast de status de presença online da equipe.
- `Bcrypt`: Usado na hook `BeforeCreate`/`BeforeUpdate` da model User e na validação.
- `JWT (jsonwebtoken)`: Assinatura de tokens Bearer.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Senhas com Bcrypt no nível de Model | `User.ts` (Hooks BeforeCreate/BeforeUpdate) | 🟢 |
| Proteção XSS com Refresh Token | `SessionController.store` (uso de cookie HTTP-Only para `jrt`) | 🟢 |
| Isolamento Multi-tenant no Login | `SessionController.store` (verificação obrigatória de `Tenant.status`) | 🟢 |

## Estado Interno
- **Presença (Online/Offline):** Mantida transacionalmente no campo `isOnline` e `lastOnline` da tabela `Users`.
- **Invalidação de Tokens:** `tokenVersion` da tabela `Users` (incrementado para forçar expiração de tokens gerados antes do incremento).

## Observabilidade
- Emissão de eventos real-time `[tenantId]:users` com action `update` contendo o estado alterado do usuário.

## Riscos e Lacunas
- 🟡 Não há menção explícita no levantamento sobre limite de taxa (Rate Limiting) no endpoint de login, sugerindo risco potencial de força-bruta (brute-force).
- 🔴 Qual a duração de expiração exata do Access Token vs Refresh Token? Fica a depender de leitura futura das vars de ambiente.
