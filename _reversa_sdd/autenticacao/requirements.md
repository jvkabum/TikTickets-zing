# Autenticação

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia o controle de acesso ao sistema, autenticando usuários via e-mail/senha, garantindo o isolamento de Tenants e mantendo a sessão JWT e Refresh Tokens em tempo real via WebSocket.

## Responsabilidades
- Autenticar usuários e emitir JWT (Acesso e Refresh)
- Renovar a sessão do usuário via refresh token (`jrt` cookie HTTP-only)
- Invalidar sessão e desconectar usuários (Logout)
- Atualizar o estado de presença (online/offline) dos usuários via Sockets

## Regras de Negócio
- Apenas usuários de Tenants (empresas) com status "active" podem realizar login 🟢
- Emissão de evento WebSocket (`[tenantId]:users`) na conexão ou desconexão para gerenciar a visibilidade em tempo real 🟢
- Senhas devem ser verificadas e criptografadas usando Bcrypt (hook BeforeCreate/BeforeUpdate do modelo User) 🟢
- Falha no acesso por tenant inativo deve retornar erro HTTP 401 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Login com E-mail e Senha | Must | Deve retornar JWT, Refresh Token e dados do usuário quando credenciais válidas e tenant ativo. |
| RF-02 | Renovação de Sessão (Refresh) | Must | Deve renovar os tokens se o cookie HTTP-only `jrt` for válido. |
| RF-03 | Logout e Invalidação | Must | Deve alterar o status para `isOnline = false`, atualizar `lastLogout` e notificar o painel. |
| RF-04 | Presença em Tempo Real | Should | Deve emitir socket event informando o estado online para os operadores do mesmo tenant. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Autenticação Baseada em JWT | `SessionController.store` / `createAccessToken` | 🟢 |
| Segurança | Cookie HTTP-only para Refresh Token | `SessionController.update` (lê cookie `jrt`) | 🟢 |
| Segurança | Criptografia de Senhas com Bcrypt | Hook de model `User` | 🟢 |
| Performance | Presença via WebSocket (Socket.io) | `[tenantId]:users` event emission | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado um usuário com credenciais válidas associado a um tenant ativo
Quando ele tenta fazer login (SessionController.store)
Então o sistema deve retornar o Token JWT e um Refresh Token
E emitir um evento websocket indicando presença online

Dado um usuário com credenciais válidas mas de um tenant inativo
Quando ele tenta fazer login
Então o sistema deve recusar o acesso com status 401

Dado um usuário logado com um Refresh Token válido
Quando seu Token JWT expira e ele solicita renovação (SessionController.update)
Então o sistema deve fornecer um novo par de tokens
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login com E-mail e Senha | Must | Caminho crítico, porta de entrada do sistema. |
| Bloqueio por Tenant Inativo | Must | Regra de negócio mandatória sem fallback. |
| Cookie HTTP-only no Refresh | Must | Prática de segurança crítica contra XSS. |
| Presença via WebSocket | Should | Importante para o painel de atendimento (SaaS), mas com alternativa se WebSocket falhar. |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/SessionController.ts` | `store`, `update`, `logout` | 🟢 |
| `backend/src/models/User.ts` | Hooks de Bcrypt | 🟢 |
