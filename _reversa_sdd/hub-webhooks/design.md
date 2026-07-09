# Hub Webhooks, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Normalização Adaptadora (Adapter Pattern) | Os parsers internos mastigam os payloads difusos de WABA e os tornam um Objeto `Message` compatível com a tabela local e com os Sockets do React | 🟢 |

## Observabilidade
- Extrema necessidade de Log de Erros. Caso o Webhook pare de mastigar o JSON da Meta por falha de Parser, a conta WABA desconecta ou o SaaS perde as mensagens do cliente no limbo.
