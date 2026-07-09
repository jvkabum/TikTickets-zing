# Requirements: Módulo de Autenticação (Auth)

> Identificador: `001-auth`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Gerencia a identidade e o ciclo de vida das sessões dos usuários no sistema multi-tenant. O módulo provê endpoints para Login, Atualização de Sessão (Refresh Token) e Logout, além de emitir eventos em tempo real informando a presença (status online) do operador aos demais usuários da empresa.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Backend` | Autenticação baseada em JWT e isolamento de Tenant. | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo:auth` | Fluxo de Controle: Login (SessionController.store), Refresh e Logout. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:auth` | Entidade `User` contendo `passwordHash`, `tenantId`, `isOnline`, `tokenVersion`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Operador / Admin | Iniciar jornada de trabalho | Realiza login no painel informando e-mail e senha válidos. |
| Operador / Admin | Encerrar jornada | Clica em Sair (Logout), invalidando a sessão e avisando os colegas que está offline. |
| Sistema (Front-end) | Manter conexão ativa | Revalida o token JWT automaticamente em background usando o cookie `jrt`. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O acesso só é permitido se a empresa associada ao usuário (`Tenant.status`) estiver como `active`. 🟢
2. **RN-02:** A senha do usuário deve ser criptografada via Bcrypt antes de salvar/atualizar no banco de dados. 🟢
3. **RN-03:** Sessões ativas emitem eventos de WebSocket (`[tenantId]:users`) para atualização de painel em tempo real. 🟢
4. **RN-04:** Um Refresh Token é mantido num cookie HTTP-only (`jrt`) para renovação de sessão, prevenindo ataques XSS primários no JWT. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Login com e-mail e senha | Must | Retorna os tokens JWT e dados do usuário se credenciais e tenant forem válidos. | 🟢 |
| RF-02 | Geração de Refresh Token HTTP-only | Must | O Refresh Token deve ser salvo como um cookie inacessível via JS do front-end. | 🟢 |
| RF-03 | Atualização de Token (Refresh) | Must | Ao receber cookie válido, emite novos tokens e devolve payload de renovação. | 🟢 |
| RF-04 | Logout Seguro | Must | Altera a data de `lastLogout`, seta `isOnline` = false e destrói o cookie local. | 🟢 |
| RF-05 | Emissão de status Online/Offline | Should | Ao logar/deslogar, o sistema emite evento WSS para o canal do Tenant com a propriedade `isOnline`. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Proteção de Rotas com JWT | Middlewares exigem Bearer Token assinado para proteger rotas da API. | 🟢 |
| Segurança | Armazenamento Hash Bcrypt | `passwordHash` na Model impede o armazenamento de senhas em plain-text. | 🟢 |
| Segurança | HTTP-Only Cookies | Uso do cookie `jrt` para mitigar roubo do token de longa duração via scripts cliente. | 🟢 |
| Isolamento | Verificação Multi-Tenant | Endpoint de login repassa `tenantId` da Model User para restringir escopo. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Login bem-sucedido de Operador ativo
  Dado que o usuário informou um e-mail cadastrado e senha correta
  E que a empresa vinculada a esse usuário está ativa
  Quando ele aciona a rota de autenticação (Store)
  Então o sistema altera o status "isOnline" para true
  E envia evento via Socket para "[tenantId]:users"
  E retorna Token Bearer, os dados do usuário e injeta cookie "jrt"

Cenário: Login bloqueado por Tenant inativo
  Dado que a empresa do usuário teve o status alterado para suspenso ou inativo
  Quando ele tentar realizar o login com senha correta
  Então o sistema retorna HTTP 401 Unauthorized com mensagem de bloqueio
  E a sessão não é iniciada
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Login) | Must | Caminho crítico para qualquer operação na plataforma. |
| RF-02 (Cookie) | Must | Base da segurança da sessão JWT na arquitetura do Vue.js. |
| RF-04 (Logout) | Must | Necessário para rotatividade de turnos em call centers. |
| RF-05 (Eventos WSS) | Should | Embora o sistema funcione sem ele, afeta a percepção de equipe "online". |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
