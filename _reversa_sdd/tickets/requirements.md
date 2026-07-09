# Tickets (Atendimentos)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Coração transacional do sistema, o módulo de Tickets centraliza a união entre os Usuários (Operadores), os Contatos (Clientes), e as automações (Filas e Bots), governando todo o ciclo de atendimento e métricas de tempo.

## Responsabilidades
- Abrigar todo o estado reativo da conversa (`pending`, `open`, `closed`).
- Registrar o histórico de ações e tempos do atendimento via auditoria para relatórios.
- Lidar ativamente com integrações cruzadas, emitindo eventos de tempo real com os motores do WhatsApp.
- Fazer a ponte para automatizações Pós-Atendimento (como mensagens de despedida e enquetes).

## Regras de Negócio
- Todo ticket nasce associado ao Root Aggregate `Tenant`, independentemente do meio (WhatsApp ou IG) 🟢
- A mensagem formal de Farewell (Despedida) é disparada automaticamente assim que o ticket muda para status "closed" 🟢
- O estado de tickets pendentes pode ser encerrado de imediato baseando-se no limite temporal inativo (`daysToClose`) 🟢
- Mudanças de status precisam obrigatoriamente notificar dezenas de canais WebSocket simultaneamente para UX fluida 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Workflow de Atendimento | Must | Modificar status do Ticket deve acoplar a data exata de início e fim (`startedAttendanceAt`, `closedAt`). |
| RF-02 | Timeline de Auditoria | Must | A rota `showLogsTicket` deve expor todas as transferências e mudanças de mão ocorridas (Tabela `LogTicket`). |
| RF-03 | Despedida com Tags Pupa | Should | Se configurada a mensagem final pelo painel, o sistema deve compilar `{name}` e `{protocol}` substituindo por dados do Banco e engatilhar disparo autônomo. |
| RF-04 | Sincronização e Reprocessamento | Could | Rota curadora que busca forçadamente mensagens perdidas ou não registradas por quedas do WhatsApp (`syncMessages`). |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Arquitetura | Root Aggregate (Domain-Driven Design) | Interseção massiva com 6 tabelas filhas (Contact, User, Whatsapp, etc) | 🟢 |
| Performance | Injeção Virtuais no Sequelize | Mensagens com scheduleDate e status "pending" são agregadas na exibição primária de `show` | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado que o operador clica no botão "Encerrar Atendimento" (status -> closed)
Quando o canal associado possui a configuração 'farewellMessage'
Então o banco atualiza a flag de tempo 'closedAt', e o bot posta internamente na Fila de Mensagens o disparo da saudação processada pelo utilitário Pupa
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Workflow de Atendimento | Must | Motor primário, todo o sistema existe em função das mudanças do estado do Ticket. |
| Logs e Auditorias de Tempo | Must | É o motor alimentador dos Dashboards gerenciais de performance (TMA e TME). |
| Mensagens Programadas Visíveis | Should | Importante para UX do operador que visualizou disparo automático futuro. |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/TicketController.ts` | Base inteira do módulo CRUD | 🟢 |
| `backend/src/services/TicketServices/*` | Agregador de lógica isolada | 🟢 |
