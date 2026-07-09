# Canais (WhatsApp), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/whatsapp` | `QueryParams (tenantId)` | `[Whatsapp]` | 200, 401 |
| POST | `/whatsapp` | `WhatsappCreate` | `Whatsapp` | 201, 400, 401 |
| PUT | `/whatsapp/:whatsappId` | `WhatsappUpdate` | `Whatsapp` | 200, 404, 401 |
| DELETE | `/whatsapp/:whatsappId` | `whatsappId` | `200 OK` | 200, 404, 401 |
| POST | `/whatsapp-session/:whatsappId`| `whatsappId` (Start Session) | `200 OK` | 200, 401 |
| DELETE | `/whatsapp-session/:whatsappId`| `whatsappId` (Stop Session) | `200 OK` | 200, 401 |

## Fluxo Principal
1. **Início da Sessão:** O usuário requisita `/whatsapp-session/:id` (ou automaticamente no boot do servidor). O `StartWhatsAppSession` aciona a biblioteca WWebJS/Baileys.
2. **Ciclo WWebJS:** Se a sessão existe no disco, ele tenta retomar (Restoring). Se falhar ou for virgem, o cliente (lib) gera um evento de "qr".
3. **Escuta do QR:** O backend captura a string do QR e dispara `[tenantId]:whatsappSession` via socket com o payload `qr`.
4. **Pronto:** O cliente escaneia, o status muda para `CONNECTED`, socket avisa o front-end, a tabela atualiza o status.

## Fluxos Alternativos
- **Desconexão Forçada:** O admin clica em desconectar, a API roda `DELETE /whatsapp-session/:id`. O WWebJS chama `client.logout()` ou o processo é derrubado. O status vira `DISCONNECTED`.
- **Exclusão Definitiva do Canal:** O `DELETE /whatsapp` não só fecha a sessão, como destrói os arquivos locais de autenticação vinculados a esse ID e apaga o registro do banco.

## Dependências
- `Baileys / Whatsapp-Web.js`: O motor por baixo dos panos que faz a comunicação via protocolo MD (Multi-device).
- `Socket.io`: Absolutamente crítico para refletir os estados `qrcode`, `connected` e `disconnected` sem delay na tela do cliente.
- `Disk IO`: Salva os `.wwebjs_auth` ou tokens do Baileys na estrutura de diretórios do servidor.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Acoplamento State-Machine no Banco | Campo `status` (ENUM) na model `Whatsapp` controla a view | 🟢 |
| Mensagens Padrão Integradas | Propriedades da classe (greetingMessage, farewellMessage) | 🟢 |

## Estado Interno
- **Sessão Local:** O legado trabalha guardando arquivos de autenticação no mesmo disco do Node.js. Isso afeta severamente o design em ambientes Kubernetes/Serverless, onde os pods morrem. Em single-VM, funciona bem.
- **Relacionamento com ChatFlow:** Uma conexão atende a um ChatFlow primário.

## Observabilidade
- Emissão contínua de status via websocket. Console.logs intensos da biblioteca do bot.

## Riscos e Lacunas
- 🔴 É estritamente stateful. Se o Node quebrar, as pastas de cache do WhatsApp devem estar num volume persistente ou as conexões cairão.
