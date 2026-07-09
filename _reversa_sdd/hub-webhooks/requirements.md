# Hub Webhooks (Canais Oficiais Meta / 360Dialog)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Camada Edge que recebe diretamente na nuvem os disparos HTTP da API Oficial do Facebook (Instagram / Messenger / WhatsApp Business API - 360). 

## Responsabilidades
- Autenticar os Handshakes iniciais do Facebook (Challenge Token).
- Decodificar e normalizar payloads JSON caóticos de diferentes produtos do Facebook para a linguagem universal da unit de Messages.
- Engatilhar a fila de recepção do SaaS.

## Regras de Negócio
- Sem o endpoint Hub a plataforma é estritamente cega para canais Oficiais (WABA e IG), funcionando só no modelo não-oficial WebJS/Baileys 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/HubWebhookController.ts` | Processador 360 e Face | 🟢 |
