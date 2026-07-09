# Canais (WhatsApp, Telegram, IG, Messenger)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Módulo raiz Omnichannel que gerencia a frota de instâncias ativas para coleta de mensagens. Inicializa e mata sessões Puppeteer/Baileys, lida com APIs da Meta e engatilha processamentos assim que uma mensagem de cliente cruza a barreira externa.

## Responsabilidades
- CRUD de Canais/Sessões definindo seu Enum restritivo de operação (whatsapp, waba, telegram, instagram, messenger).
- Restringir novas sessões para não ultrapassar orçamentos técnicos da infraestrutura.
- Matar sessões zumbis e processos NodeJS sub-orquestrados ao se inativar ou excluir a conexão.
- Despachar informações sobre quedas a webhooks do SaaS.

## Regras de Negócio
- A infraestrutura global e a do Tenant ditam o teto numérico de sessões que podem existir 🟢
- Se houver deleção de um Canal, o serviço em memória dele deve ser extirpado para não vazar RAM do Server 🟢
- Integrações da Meta (WABA/Messenger) ganham, no ato do cadastro, um Token JWT de 10000 dias (Hook BeforeCreate) para proteger seus endpoins de Webhook de ataques de força bruta 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/WhatsAppController.ts` | Base Conexões | 🟢 |
| `backend/src/models/Whatsapp.ts` | Enums de type e Webhooks JWT | 🟢 |
