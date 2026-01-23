---
slug: automation-flows
category: features
generatedAt: 2026-01-23T15:52:00.000Z
relevantFiles:
  - backend\src\services\AutoReplyServices\VerifyActionStepAutoReplyService.ts
  - backend\src\models\StepsReply.ts
  - frontend-vue-3\src\components\ccFlowBuilder\FlowBuilder.vue
---

# Como funcionam os fluxos de automação (Chatbot)?

## Automação e Chatbot (Flow Builder)

A automação é baseada em estados e passos, permitindo criar jornadas de autoatendimento.

### Detalhes de Implementação

- **Símbolo de Lógica**: `VerifyActionStepAutoReplyService` - Responsável por identificar se o cliente digitou uma opção válida de um menu de chatbot.
- **Símbolo de Modelo**: `StepsReply` - Define o conteúdo da mensagem do bot e as ações vinculadas (ex: transferir para fila).
- **Símbolo Visual**: `FlowBuilder` - Componente do frontend que permite a construção visual do fluxo (Nós e Conexões).
- **Símbolo de Histórico**: `CreateAutoReplyLogsService` - Registra a interação do cliente com o robô para fins de auditoria.
---
