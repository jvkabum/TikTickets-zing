# Campanhas

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Sistema de disparo automático em background focado em Marketing Massivo. Gerencia o despacho escalonado e seguro de lotes gigantes de notificações, evitando punições por Spam.

## Responsabilidades
- Engatilhar mensagens de texto e mídia a listas extensas de Contatos.
- Alternar estrategicamente os conteúdos e injetar interpolações para forjar pessoalidade.
- Suspender ou adiar disparos mapeados para ocorrer na madrugada do cliente (respeito a SLA Comercial).
- Promover Status dinâmico (`finished`) na auto-conclusão da leitura.

## Regras de Negócio
- Horário Comercial Automático ativado para disparos fora das 08h e 20h. O agendamento atrasa obrigatoriamente a execução para 08:30 do dia seguinte 🟢
- Rotação de texto A/B/C (`message1`, `message2`, `message3`) mandatória para diversificar payload e evadir algoritmos do Facebook/Meta 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/services/CampaignServices/StartCampaignService.ts` | Agendador Primário | 🟢 |
| `backend/src/models/Campaign.ts` | Hooks de Conclusão | 🟢 |
