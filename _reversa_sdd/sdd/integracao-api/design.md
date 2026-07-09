# Integração API Externa, Design Técnico

## Interface

Para endpoints HTTP Internos (Painel Admin):

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/api-configs` | `QueryParams` | `[ApiConfig]` | 200, 401 |
| POST | `/api-configs` | `{ name, sessionId, urlServiceStatus }` | `ApiConfig (com token gerado)` | 201, 400 |
| PUT | `/api-configs/:id` | `ApiConfigUpdate` | `ApiConfig` | 200, 404 |
| DELETE | `/api-configs/:id` | `id` | `200 OK` | 200, 404 |

Para endpoints HTTP Externos (Públicos / ERP):

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| POST | `/api/messages/send` | `{ number, body, medias? }` | `{ mensagem }` | 200, 401, 400 |

## Fluxo Principal
1. **Autenticação:** O middleware `isAuthApi` intercepta chamadas na rota `/api/...`. Ele lê o Bearer Token, busca no Postgres a `ApiConfig` correspondente. Se achar, anexa o `tenantId` e `sessionId` (whatsappId) à requisição (`req.apiConfig`).
2. **Delivery:** O Controller recebe o payload e despacha para o serviço local do WhatsApp (`SendWhatsAppMessageService`), passando o `whatsappId` amarrado àquela chave de API.
3. **Persistência:** A mensagem é salva na tabela de histórico comum (`Message`), mas também pode ser gravada na tabela específica `ApiMessage` para fins de debug e bilhetagem separada do ERP.

## Fluxos Alternativos
- **Webhook de Retorno (StatusCallback):** Quando o evento `message.ack` (recebimento/leitura) estoura no listener do Baileys, o sistema verifica se a mensagem original veio da API. Se sim, e a `urlServiceStatus` estiver preenchida, o Axios faz um POST enviando `{ messageId, ack, timestamp }` para a URL do ERP cliente.

## Dependências
- `Axios`: Utilizado pelo Backend para fazer as chamadas Webhook pro ERP do cliente.
- Autenticador Customizado: Middlewares separados das rotas comuns (que usam a Auth do painel de operador).

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Isolamento de Rota | Prefixos isolados (`/api/`) com middleware dedicado de JWT para integrações de máquina. | 🟢 |
| Amarração de Canal | A chave da API aponta duramente para uma Sessão do WhatsApp, não é genérica no Tenant. | 🟢 |

## Estado Interno
- Sem estado de sessão HTTP, autenticação puramente Token-based stateless.

## Observabilidade
- A tabela `ApiMessage` serve como única fonte da verdade analítica se um cliente reclamar que "a mensagem via API não chegou".

## Riscos e Lacunas
- 🟡 Caso o ERP externo inunde o Endpoint `/api/messages/send` com 5.000 chamadas por segundo (DDoS Acidental), o endpoint processa de forma síncrona, podendo arriar a fila do Baileys. O design mais maduro seria colocar o `/send` para jogar o payload num Redis (BullMQ) e responder "202 Accepted", mas a interface síncrona é legado e mantê-la é o escopo desta unit.
