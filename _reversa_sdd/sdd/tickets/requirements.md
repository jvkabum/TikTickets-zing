# Requirements: Módulo de Atendimentos (Tickets)

> Identificador: `004-tickets`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo de Tickets é o núcleo operacional da plataforma. Ele atua como um Root Aggregate que vincula conversas de clientes (Contact), operadores (User), conexões (Whatsapp), Automações (ChatFlow/AutoReply) e Filas. É nele que os atendimentos são iniciados, mantidos e encerrados, centralizando a linha do tempo de interações (Logs) e mensagens.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:tickets` | Controller gerencia ciclo de vida, envia mensagem de despedida, agrega mensagens agendadas e cria protocolos. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:tickets` | Entidades Ticket, Protocol e LogTicket para auditoria. Ticket guarda métricas temporais. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Cliente Final | Ser atendido | Envia uma mensagem no canal. Um ticket é criado ou reaberto no status "pending" até um bot ou humano interagir. |
| Operador | Realizar o atendimento | Aceita o ticket da fila (muda para "open"), conversa com o cliente e depois encerra o chamado ("closed"). |
| Administrador | Auditoria | Verifica o histórico do ticket (`LogTickets`) para ver por quais operadores e filas o chamado passou. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Tickets possuem 3 estados principais de ciclo de vida: `pending` (aguardando na fila ou bot), `open` (em atendimento por um usuário) e `closed` (finalizado). 🟢
2. **RN-02:** O fechamento de um ticket dispara o envio de uma Mensagem de Despedida automática (formatada via biblioteca `pupa` para injeção de nome e protocolo) caso a conexão (Canal/Whatsapp) possua essa configuração ativa. 🟢
3. **RN-03:** Todas as transições de status geram instâncias de auditoria imutáveis na tabela `LogTicket` (ex: "access", "create", "transfer"). 🟢
4. **RN-04:** Um único Ticket pode ser transferido múltiplas vezes. O tempo gasto por cada atendente individual é rastreado para que as métricas futuras de TME e TMA sejam precisas. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Listagem rica (Inbox) | Must | Exibe os tickets filtrados por fila, status e usuário, com contagem de `unreadMessages`. | 🟢 |
| RF-02 | Aceite e Transferência | Must | Um operador pode aceitar um ticket pending e transferi-lo para outra Fila/Usuário. | 🟢 |
| RF-03 | Timeline e Auditoria | Must | Acesso ao log cronológico detalhando quem transferiu, quando assumiu e quando fechou o chamado. | 🟢 |
| RF-04 | Despedida Dinâmica | Should | Injetar {name} e {protocol} no corpo da farewellMessage antes de processar o encerramento. | 🟢 |
| RF-05 | Visão de Agendamentos | Could | Na leitura do ticket, injetar no payload mensagens já cadastradas que estão agendadas para envio futuro. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Reatividade Extrema | Qualquer atualização via API REST é seguida de uma chuva de eventos WebSocket (`[tenantId]:[ticketId]`) para UI em tempo real sem F5. | 🟢 |
| Rastreabilidade | Root Aggregate | Entidade Ticket conecta FKs de dezenas de tabelas de forma indexada. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Fechamento de ticket com Despedida Ativa
  Dado que o Ticket "123" do Cliente "Maria" está "open"
  E o Canal pelo qual Maria fala tem a mensagem: "Tchau {name}, seu protocolo é {protocol}"
  Quando o Operador clicar em Finalizar (update status="closed")
  Então o sistema atualiza "closedAt" e insere no Log
  E engatilha uma CreateMessageSystemService enviando: "Tchau Maria, seu protocolo é 9999"

Cenário: Transferência entre Filas
  Dado que o Ticket está na fila "Suporte" com Atendente "A"
  Quando "A" transfere para a fila "Financeiro"
  Então o status "userId" do Ticket passa a ser null (ou o Id específico do Atendente alvo)
  E um registro "transfer" é gravado em LogTicket
  E a tela de Inbox do "Atendente A" esconde o ticket instantaneamente via Socket
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Listagem) | Must | Sem inbox, o produto não existe. |
| RF-02 (Aceite) | Must | Permite roteamento e fluxo de call center. |
| RF-03 (LogTicket) | Must | Requisito legal para ouvidorias e auditoria interna do cliente SaaS. |
| RF-04 (Despedida) | Should | Funcionalidade muito esperada mas que tem fallback. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
