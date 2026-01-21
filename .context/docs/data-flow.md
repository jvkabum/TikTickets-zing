# Fluxo de Dados: TikTickets-zing

Este documento descreve como os dados entram, circulam e saem do sistema TikTickets.

## Entrada de Dados (Ingress)
1. **Webhook/Polling WhatsApp**: As mensagens chegam via `whatsapp-web.js`.
2. **REST API**: O frontend envia comandos (enviar mensagem, criar ticket, etc).
3. **Socket.io**: Eventos externos ou de outros atendentes.

## Processamento Interno
1. **Camada de Serviço (`WbotServices`)**: Processa a mensagem bruta, identifica o `tenantId` e o contato.
2. **Fila de Mensagens**: Mensagens de saída podem ser enfileiradas para evitar bloqueio do WhatsApp.
3. **Persistência**: Dados são salvos no PostgreSQL via Sequelize.

## Saída de Dados (Egress)
1. **Envio de Mensagem**: O `Wbot` envia para o destinatário via Chromium.
2. **Socket.io Real-time**: O backend notifica os frontends conectados sobre novas mensagens ou mudanças de status.
3. **Relatórios**: Dados agregados para exportação e dashborads.

## Integrações Externas
- **WhatsApp Web**: Via Puppeteer.
- **Redis**: Cache de sessões e controle de concorrência.
- **PostgreSQL**: Estado persistente de tickets e usuários.
