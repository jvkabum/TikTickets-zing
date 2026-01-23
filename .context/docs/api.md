---
type: doc
name: api
description: Guia de endpoints, autenticação JWT e integração via API Externa V1
category: reference
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Documentação Completa da API (REST)

O TikTickets-zing v4 expõe uma API RESTful robusta para gestão de multi-atendimento, automação e administração multi-tenant.

## Padrões Globais

- **Base URL**: `http://localhost:8080` (Desenvolvimento)
- **Content-Type**: `application/json`
- **Autenticação**: Header `Authorization: Bearer <TOKEN>`.
- **Tenant Scope**: O `tenantId` é injetado automaticamente pelo middleware `isAuth` (Localizado em `backend/src/middleware/isAuth.ts`).

## 🔐 Autenticação e Segurança

### Middleware `isAuth`
O sistema utiliza **JWT (JSON Web Tokens)**. Ao validar o token, o backend extrai:
*   `id` (do usuário)
*   `tenantId` (da empresa)
*   `profile` (admin/user)

Esses dados são anexados ao `req.user`, permitindo que todos os services subsequentes filtrem os dados corretamente.

## 📡 Principais Endpoints

### 1. Tickets (`/tickets`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/tickets` | Lista tickets (pendentes, abertos, fechados). Suporta query params. |
| POST | `/tickets` | Abre um novo ticket manualmente. |
| PUT | `/tickets/:id` | Atualiza status ou troca o atendente/fila. |
| POST | `/tickets/:id/close` | Encerra o atendimento. |

### 2. Mensagens (`/messages`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/messages/:ticketId` | Busca histórico de mensagens de um ticket. |
| POST | `/messages/:ticketId` | Envia mensagem (Texto ou Mídia). Inicia o Job `SendMessages`. |

### 3. Conexões WhatsApp (`/whatsapp`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/whatsapp` | Lista instâncias de WhatsApp do tenant. |
| POST | `/whatsappsession/:id` | Inicia o processo de conexão (Gera QR Code). |
| DELETE| `/whatsappsession/:id` | Encerra a sessão e desconecta o bot. |

## 🚀 API Externa (V1)
Para integrações externas (ERPs, CRMs), o sistema disponibiliza a rota:
- **Endpoint**: `/v1/api/external/:apiId`
- **Autenticação**: Token de API configurado no dashboard do Tenant.
- **Função**: Permite o envio de mensagens programáticas sem passar pelo fluxo de atendente.

## 📋 Padrão de Resposta de Erro
Todas as APIs retornam o seguinte objeto em caso de falha (4xx ou 5xx):
```json
{
  "error": "ERR_MSG_NOT_SENT",
  "message": "Nao foi possivel enviar a mensagem, verifique a conexao.",
  "details": { "retry": true }
}
```

## Recursos Relacionados
- [architecture.md](./architecture.md)
- [security.md](./security.md)
- [data-flow.md](./data-flow.md)
