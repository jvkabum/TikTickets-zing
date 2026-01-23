---
type: doc
name: data-flow
description: Fluxo detalhado de mensagens, eventos de socket e processamento assíncrono (Job Lifecycle)
category: architecture
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Fluxo de Dados e Integrações

Este documento detalha o ciclo de vida da informação dentro do TikTickets-zing, desde a chegada de uma mensagem no WhatsApp até a atualização em tempo real no dashboard do atendente.

## 📥 Fluxo de Entrada (Inbound Message)

1.  **Evento WhatsApp**: O `whatsapp-web.js` detecta uma nova mensagem no Puppeteer.
2.  **Middleware de Evento**: Capturado em `wbot.ts`, o evento é disparado para o `WbotMessageListener`.
3.  **Processamento (Service)**:
    *   **Identificação**: Verifica o contato e o `tenantId` da sessão.
    *   **Ticket**: Busca um ticket `open` ou `pending`. Se não houver, cria um novo via `FindOrCreateTicketService`.
    *   **Persistência**: Grava a mensagem no PostgreSQL via Sequelize.
    *   **Mídia**: Se houver anexo, o arquivo é baixado para `public/[tenantId]/` e o path é salvo.
4.  **Notificação Real-time**: O backend utiliza o `getIO().to(tenantId).emit(...)` para notificar todos os atendentes conectados sobre a nova mensagem.

## 📤 Fluxo de Saída (Outbound Message)

1.  **Frontend**: O atendente digita a mensagem e clica em enviar.
2.  **API**: Requisição `POST /messages/:ticketId`.
3.  **Queue Injection**: A mensagem não é enviada diretamente. Ela é inserida na fila `SendMessages` do **BullMQ**.
4.  **Worker**: O processador de fila em `backend/src/jobs/SendMessages.ts` retira a mensagem.
5.  **Envio Real**: Chama o `wbot.sendMessage()`.
6.  **Confirmação**:
    *   Sucesso: Atualiza o status da mensagem no log para "enviada".
    *   Falha: Realiza até 3 retentativas com backoff.

## 🔄 Fluxo de Sincronia de Sessão (Watchdog)

O sistema utiliza um loop de monitoramento para garantir que as sessões não fiquem "travadas":
*   **CheckMessages**: A cada 30-60 segundos (configurável), o sistema verifica o estado real da conexão.
*   **Falsa Conexão**: Se o Puppeteer reportar `CONNECTED` mas falhar no `verifyRealConnection` (ex: falha ao buscar foto de perfil), o sistema força uma **Reconexão Progressiva**.

## 🛠️ Integrações e Sockets

### Namespacing do Socket.io
- **Global Tenant**: `socket.join(tenantId)` - Recebe eventos de novos tickets e mudanças globais.
- **Ticket Specific**: `socket.join(`${tenantId}:${ticketId}`)` - Recebe o fluxo de mensagens de uma conversa específica aberta na tela.

### Jobs Assíncronos (Redis DB 3)
| Job | Gatilho | Responsabilidade |
| :--- | :--- | :--- |
| `SendMessages` | API Outbound | Garante entrega e evita rate-limit. |
| `CampaignProcess` | Scheduler | Orquestra disparos em massa. |
| `SyncUnread` | Login/Handshake | Sincroniza mensagens perdidas durante o offline. |

## Recursos Relacionados
- [architecture.md](./architecture.md)
- [api.md](./api.md)
- [database.md](./database.md)
