---
slug: multi-channel
category: architecture
generatedAt: 2026-01-23T15:58:00.000Z
relevantFiles:
  - backend\src\services\TbotServices\tbotMessageListener.ts
  - backend\src\services\WABA360\VerifyMessage360.ts
  - backend\src\services\InstagramBotServices\InstagramVerifyMessage.ts
  - backend\src\services\MessengerChannelServices\MessengerVerifyMessage.ts
---

# Como o sistema integra múltiplos canais (Telegram, WABA, Instagram, Messenger)?

## Integração Multi-Canal

O TikTickets-zing abstrai as diferenças entre as APIs de mensageria para que o atendente use a mesma interface de ticket independente da origem.

### Detalhes de Implementação

- **Telegram**: Utiliza a `TbotServices`, baseada na biblioteca `telegraf`, gerenciando webhooks e mensagens via `HandleMessageTelegram`.
- **WABA 360**: Integração oficial via `WABA360 Services`. Ao contrário do Wbot (Web), ele depende 100% de Webhooks externos configurados via `SetWebHookUrl`.
- **Meta (Instagram/Messenger)**: Implementado via `InstagramBotServices` e `MessengerChannelServices`. O sistema mapeia os webhooks da Graph API para os modelos internos de `Contact` e `Message`.
- **Unificação**: Todos os canais convergem para o `HandleMessageReceivedService`, que normaliza o payload e decide se cria um novo ticket ou anexa a um existente.
