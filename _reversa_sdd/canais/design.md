# Canais, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Hooks Notificadores via Bull Redis | Emissões de "DISCONNECTED" em `Whatsapp` caem na fila `WebHooksAPI` para evitar delay | 🟢 |
| Token JWT estático como Auth | Criação automática via BeforeCreate (`tokenHook`) com duração eterna de 10000d | 🟢 |

## Fluxos Alternativos
- **Notificação de Queda:** Se a máquina desliga a conexão `CONNECTED -> DISCONNECTED`, o Observer `@AfterUpdate` captura, averigua se a tabela `ApiConfig` tem `urlServiceStatus` configurada, e empurra pra fila do Redis um Job mandando HTTP POST pro servidor corporativo do cliente avisando do erro.
