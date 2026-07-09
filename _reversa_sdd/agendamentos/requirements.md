# Agendamentos (Schedules)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia os envios individuais postergados (ex: "Enviar mensagem para o João na Sexta-Feira de manhã para confirmar a consulta"). Diferencia-se das Campanhas por ser Unitário e amarrado a um Ticket vivo.

## Responsabilidades
- Armazenar e listar as mensagens com timestamp futuro programado na tela.
- Executar rotina sentinela que periodicamente despacha as mensagens caducadas para envio.

## Regras de Negócio
- A mensagem agendada não transita livremente como "Enviada" até o motor temporal processá-la, permanecendo invisível para a integração da rede social até aquele minuto 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/services/ScheduleServices/*` | Agendadores de banco | 🟢 |
| `backend/src/services/WbotServices/SendMessagesSchendulesWbot.ts` | Cron Job / Varredor | 🟢 |
