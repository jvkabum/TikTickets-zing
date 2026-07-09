# Integração API Externa, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| UUID como PK | Token amigável de integração usando hash alfanumérico padrão na Tabela de Integrações | 🟢 |
| Job Desacoplado na Resposta | Ao receber requisições de mensageria em `sendMessageAPI`, devolve instantaneamente código 200 pro RD Station e joga pro QueueService enfileirar no Redis | 🟢 |

## Fluxos Alternativos
- **Desfibrilador de Sessão:** A rota `startSession` possibilita ao cliente final engatilhar uma rotina corretiva pelo ERP no evento de um "Whatsapp Offline", instruindo forçadamente o Backend do SaaS a refazer os handshakes da puppeteer.
