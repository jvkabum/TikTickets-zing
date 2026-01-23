---
slug: media-handling
category: operations
generatedAt: 2026-01-23T16:02:00.000Z
relevantFiles:
  - backend\src\services\WbotServices\WbotMessageListener.ts
  - backend\src\services\MessageServices\CreateMessageService.ts
  - backend\src\libs\wbot.ts
---

# Como o sistema gerencia o download e armazenamento de mídias?

## Gerenciamento de Mídias

O sistema garante que fotos, vídeos e áudios recebidos sejam persistidos localmente para evitar perdas se a sessão do WhatsApp cair.

### Detalhes de Implementação

- **Interceptação**: Quando o `WbotMessageListener` detecta que `msg.hasMedia` é verdadeiro, ele invoca o download do buffer via Puppeteer.
- **Armazenamento Local**: Os arquivos são salvos no diretório `public/` (ou caminho configurado no `.env`), organizados em subpastas ou com nomes únicos baseados no ID da mensagem.
- **Banco de Dados**: O `CreateMessageService` salva o path relativo do arquivo na coluna `mediaUrl` da tabela `Messages`.
- **Serviço de Mídia**: O backend atua como um servidor de arquivos estáticos para que o frontend (Vue 3) consiga renderizar o `MediaViewer` sem bater diretamente nos servidores do WhatsApp.
- **Áudios**: Mensagens de voz são convertidas/tratadas para garantir compatibilidade com o player do navegador.
