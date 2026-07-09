# Mensagens (Messages)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Coração da mensageria pura. Encarregada de gravar fisicamente o texto e os caminhos dos arquivos enviados e recebidos entre Operadores e Clientes.

## Responsabilidades
- Fornecer endpoints de CRUD de mensagens em um Ticket.
- Processar Upload de mídias (áudio, foto, vídeo e documentos).
- Despachar o comando real de envio para a biblioteca de conexão da Meta (Baileys, Wbot).
- Sincronizar lacunas de mensagens perdidas quando o WhatsApp sai de sincronia.

## Regras de Negócio
- A recepção ou envio da mensagem atualiza a coluna `unreadMessages` e a coluna `lastMessage` do Ticket Pai 🟢
- Mensagens de voz em OGG devem ser nativamente suportadas no frontend injetadas pelo Backend URLs 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD de Mensagem de Texto e Mídia | Must | Rotas de listagem por ticket (com hasMore para infinite scroll do front) e envio. |
| RF-02 | Sync Automático (Recuperação) | Should | Forçar o client web a baixar histórico anterior do celular quando um ticket em branco é aberto. |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/MessageController.ts` | Listagem Paginada | 🟢 |
| `backend/src/services/WbotServices/SendMessagesSystemWbot.ts` | Proxy de envio real | 🟢 |
