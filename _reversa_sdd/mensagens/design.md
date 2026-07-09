# Mensagens, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Infinite Scroll nativo | Controlador usa Offset/Limit mandando flag `hasMore` para a interface UI rebuscar o topo | 🟢 |
| Padrão Proxy (Facade) | Controller não toca na Lib Baileys, ele delega para `SendMessageSystemProxy` que sabe distinguir se a Channel é Zap, Face ou Telegram | 🟢 |

## Fluxos Alternativos
- **Fallback de Sincronia:** Se o evento WebSocket de recebimento de mensagem falhar (perda de pacotes), o Front pode invocar `syncMessages` reengatilhando a varredura da session no Baileys.
