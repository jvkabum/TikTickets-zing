# Requirements: Módulo de Configurações (Settings)

> Identificador: `011-configuracoes`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo centraliza parâmetros e chaves lógicas que governam o comportamento dinâmico do sistema inteiro, como ativação de NPS, permissão de signup, respostas a chamadas de voz, entre outros. Utiliza um padrão chave-valor genérico.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Débitos Críticos` | Leak de TenantId: O legado possuía risco de vazar configurações se o filtro de `tenantId` fosse esquecido. | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo:settings` | Controller de chave-valor. Usado exaustivamente como feature flags ao redor de todo o código. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:settings` | Entidade `Setting` (`key`, `value`). | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador | Ajuste fino | No painel, ele marca a opção "Rejeitar ligações". O frontend atualiza a key `callRejectMessage` com a mensagem desejada, o que dita o comportamento do Bot. |
| Engine Backend | Feature Flag | Antes de permitir que um usuário crie conta pela URL pública, a API lê a key `userCreation`. Se for "disabled", bloqueia. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** (CORREÇÃO DE DÉBITO) As configurações são estritamente isoladas por `tenantId`. Nenhuma leitura de `Setting` na aplicação inteira deve ocorrer sem o ID da empresa. 🟢
2. **RN-02:** Valores (values) são tipados no banco como strings (`VARCHAR` ou `TEXT`), exigindo cast lógico na camada de negócio (ex: "enabled" vira `true`). 🟢
3. **RN-03:** As keys conhecidas devem ser mapeadas em constantes ou Enums para evitar typo-errors que fariam a feature flag ser ignorada. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD Chave-Valor | Must | Permitir listar (GET) todas as configs de uma empresa e atualizar (PUT) individualmente. | 🟢 |
| RF-02 | Fallback de Default | Must | Se uma chave não existir no banco para a Empresa X, o sistema deve assumir um default seguro (ex: `CheckMsgIsGroup` = "disabled"). | 🟢 |
| RF-03 | População Inicial | Should | Ao criar um Tenant novo, o sistema injeta os `Settings` iniciais para aquela empresa. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Cacheamento de Memória | Sendo lida milhares de vezes por segundo no listener do WhatsApp, o BD vai arriar se não usar Redis/MemoryCache para as configs. | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Leitura segura de configuração
  Dado que a API precisa saber se a Empresa B permite ligações (key: "callReject")
  Quando ela chamar o SettingService
  Então a query OBRIGATORIAMENTE será "WHERE key = 'callReject' AND tenantId = Empresa_B_Id"
  E se não houver registro, retorna um valor default pré-definido no código.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Ler e Atualizar) | Must | O painel do cliente precisa governar as próprias features. |
| RF-02 (Default segurados) | Must | Evita crashes de runtime ao ler `undefined`. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
