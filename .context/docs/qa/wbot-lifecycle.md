---
slug: wbot-lifecycle
category: operations
generatedAt: 2026-01-23T15:46:00.000Z
relevantFiles:
  - backend\src\libs\wbot.ts
  - backend\src\services\WbotServices\wbotMonitor.ts
  - backend\src\services\WbotServices\SessionCleanupService.ts
---

# Como as sessões do WhatsApp (Wbot) são gerenciadas e recuperadas?

## Gerenciamento de Ciclo de Vida do Wbot

As sessões utilizam instâncias do `whatsapp-web.js` com um monitoramento ativo de integridade.

### Detalhes de Implementação

- **Símbolo Core**: `initWbot` - Função que inicializa o cliente Puppeteer com as opções de `LocalAuth`.
- **Símbolo de Monitoramento**: `verifyRealConnection` - Mecanismo que valida se a conexão está ativa enviando pings/leituras reais.
- **Símbolo de Recuperação**: `forceReconnect` - Executa a lógica de reconexão progressiva em caso de falha detectada.
- **Símbolo de Limpeza**: `cleanupWbotSession` - Encerra processos Chromium órfãos e limpa cache de sessão para reinicialização fria.
- **Símbolo de Watchdog**: `watchdogTimer` - Timer que garante o disparo do evento `ready` em janelas de tempo seguras.
