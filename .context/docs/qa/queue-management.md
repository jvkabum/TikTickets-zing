---
slug: queue-management
category: features
generatedAt: 2026-01-23T15:54:00.000Z
relevantFiles:
  - backend\src\services\QueueServices\CreateQueueService.ts
  - backend\src\models\Queue.ts
  - backend\src\models\UserQueue.ts
---

# Como funciona a gestão de filas e departamentos?

## Gestão de Filas (Queue Management)

As filas organizam o atendimento por departamentos e vinculam usuários a tipos específicos de conversa.

### Detalhes de Implementação

- **Símbolo de Estrutura**: `Queue` - Modelo que define o nome da fila (Suporte, Vendas) e cores para a interface.
- **Símbolo de Vínculo**: `UserQueue` - Tabela de associação que determina quais atendentes têm permissão para visualizar tickets de cada fila.
- **Símbolo de Serviço**: `UpdateQueueService` - Permite alterar as configurações da fila em tempo real sem desconectar usuários.
- **Símbolo de Roteamento**: `ListQueueService` - Utilizado no frontend para mostrar ao cliente as opções de departamentos disponíveis no primeiro contato.
