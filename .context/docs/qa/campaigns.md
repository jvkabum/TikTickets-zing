---
slug: campaigns
category: features
generatedAt: 2026-01-23T15:50:00.000Z
relevantFiles:
  - backend\src\services\CampaignServices\StartCampaignService.ts
  - backend\src\models\Campaign.ts
  - backend\src\jobs\CampaignProcess.ts
---

# Como funcionam as campanhas de disparo em massa?

## Campanhas (Campaigns)

O sistema gerencia disparos em massa de forma assíncrona para evitar bloqueios das contas de WhatsApp.

### Detalhes de Implementação

- **Símbolo de Ativação**: `StartCampaignService` - Serviço que valida a campanha e inicia o processamento dos contatos.
- **Símbolo de Modelo**: `Campaign` - Armazena metadados da campanha, como data de início, mensagem e arquivos anexos.
- **Símbolo de Processamento**: `CampaignProcess` - Job do BullMQ que retira os contatos da fila e realiza o envio pausado para simular comportamento humano.
- **Símbolo de Controle**: `CancelCampaignService` - Permite interromper um envio em andamento.
