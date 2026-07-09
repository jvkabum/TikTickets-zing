# Requirements: Módulo de Fluxo de Chat (Chatflow)

> Identificador: `007-chatflow`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo Chatflow é o motor de automação (Bot builder) da plataforma. Permite aos administradores construir árvores de decisão em formato JSON (representadas visualmente no Front-end) para qualificar leads, entregar autoatendimento e transbordar o atendimento para a Fila ou Usuário correto de forma automatizada, antes do atendimento humano iniciar.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:chatflow` | Gestão de JSON Nodes e execução em tempo de mensagem do cliente. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:chatflow` | Entidade `ChatFlow` com coluna `flow` e `celularTeste`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador | Automatizar triagem | Desenha um fluxo que pergunta "Você quer Vendas ou Suporte?" e encaminha o cliente para a Fila correspondente usando nós lógicos. |
| Cliente Final | Autoatendimento | Interage com menus numéricos de bot (Ex: "Digite 1 para..."), recebendo respostas automáticas ou sendo transferido. |
| Testador | Homologar Fluxo | Usa o recurso `celularTeste` para rodar o fluxo em um número de WhatsApp específico antes de publicar para todos os clientes. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O fluxo é atrelado a um `TenantId`. Se o Tenant tiver múltiplos números de WhatsApp, as configurações de Canal definirão qual Chatflow aquele número executa. 🟢
2. **RN-02:** A lógica inteira da árvore (nodes, edges, ações) fica armazenada nativamente no banco de dados dentro da coluna `flow` (JSONB). 🟢
3. **RN-03:** O fluxo de chat tem prioridade de interceptação. Enquanto o cliente estiver sendo tratado por um `ChatFlow` ativo, o Ticket se mantém `pending` e não gera notificação ruidosa para humanos. 🟢
4. **RN-04:** Um nó do tipo "ação" (`action`) pode transferir o ticket para uma `Queue` ou `User`, finalizando a execução do bot e repassando o controle à interface Inbox. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD do Fluxograma | Must | Interface de API para salvar o array de Nós e Arestas. | 🟢 |
| RF-02 | Interpretação de Nós de Menu | Must | Bot envia opções numéricas e aguarda a entrada do usuário para navegar ao próximo nó. | 🟢 |
| RF-03 | Ação de Roteamento | Must | Nós de transbordo (`queue_transfer`) alteram a `queueId` do Ticket associado. | 🟢 |
| RF-04 | Chamada de API Externa | Should | Nós do tipo `webhook` ou `api` podem fazer GET/POST para sistemas terceiros usando o input do cliente. | 🟢 |
| RF-05 | Modo de Teste | Should | Executar o bot apenas para o número cadastrado em `celularTeste` quando `isActive` = falso. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Parsing em Memória | A árvore JSON precisa ser lida rapidamente a cada webhook de mensagem do WhatsApp. | 🟢 |
| Resiliência | Prevenção de Loop | O engine do bot deve proteger contra loops infinitos (ex: fallback circular). | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Teste isolado do fluxo
  Dado que um Chatflow recém-criado está inativo ("isActive": false)
  E tem o "celularTeste" configurado como "551199999999"
  Quando o Cliente "551199999999" envia "Oi"
  Então o Bot processa a árvore de chat e responde
  E Quando qualquer outro cliente envia "Oi", o Bot os ignora.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Salvar JSON) | Must | Sem persistência, não há bot. |
| RF-02 (Menus Lógicos) | Must | Funcionalidade básica de URA digital. |
| RF-03 (Transbordo) | Must | O objetivo do bot de triagem é entregar para um humano no final. |
| RF-04 (API Externa) | Could | Usado em integrações avançadas, pode ficar para uma fase posterior se necessário. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
