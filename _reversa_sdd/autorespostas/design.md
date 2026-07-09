# Auto-respostas, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Expressões Regulares de Matching | O Interceptador lê os tickets Pending em tempo real testando matches simples do Array de AutoReplies em memória / BD | 🟢 |

## Riscos e Lacunas
- 🟡 Qual a diferença exata da hierarquia entre o Bot Chatflow e a Auto-Resposta na fila de escuta? O código não relata com clareza quem bate primeiro no interceptador (provavelmente a AutoReply por ser estática, mas demanda inspeção no oráculo).
