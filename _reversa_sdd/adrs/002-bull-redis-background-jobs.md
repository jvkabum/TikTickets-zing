# ADR 002: Offloading de Campanhas e Webhooks via Bull/Redis

**Status:** 🟡 Inferido Através do Código
**Data:** 2026-07-09

## Contexto
O envio de campanhas massivas de WhatsApp, disparos de webhooks de mudança de status e integração via API Inbound (Headless) possuem tempos de resposta imprevisíveis devido às latências de rede e limitações da API da Meta. Realizar essas operações síncronamente bloquearia o Event Loop do NodeJS.

## Decisão
Uso intensivo do pacote **Bull** rodando sobre um servidor **Redis**. Mensagens em massa entram num `Queue.add` com P.A. (Progressão Aritmética) de delays, e as rotas HTTP respondem `200 OK` instantaneamente.

## Alternativas consideradas
- *Processamento síncrono no Node*: Bloquearia o processador single thread e derrubaria a aplicação em caso de alta volumetria.
- *RabbitMQ/Kafka*: Overhead de infraestrutura alto para as necessidades atuais, o Redis já é comumente usado em stacks Node.js.

## Consequências
- **Positivas:** Escalabilidade brutal. O Event Loop se mantém livre para servir o WebSocket e painel admin. Tolerância a falhas do WhatsApp.
- **Negativas:** Adiciona o Redis como dependência mandatória da infraestrutura. O processamento se torna *Eventually Consistent*, necessitando estratégias de hooks do Sequelize (como visto em `@AfterFind` da Campaign) para reconciliar os status finalizados com o BD principal.
