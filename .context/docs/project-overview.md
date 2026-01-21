# Visão Geral do Projeto: TikTickets-zing

O **TikTickets-zing** é uma plataforma robusta de atendimento e gestão de canais de comunicação (Omnichannel), focada na integração com o WhatsApp através do `whatsapp-web.js`.

## Objetivos Principais
- Prover uma interface unificada para múltiplos atendentes.
- Suportar diversos canais de comunicação (WhatsApp, Telegram, Messenger).
- Gestão de tickets, contatos e automações (Chatbots).
- Suporte a Multi-Tenancy (múltiplas empresas em uma única instância).

## Pilares Tecnológicos
- **Backend**: Node.js >= 20, Express, Sequelize (PostgreSQL), Redis (Bull/Queue).
- **Frontends**: 
  - `frontend-vue-3`: **Interface principal de foco**. Desenvolvida com **Vue 3.5+**, Quasar 2.17, Pinia e Tanstack Vue Query.
  - `frontend`: Versão legada em **Vue 2.7**, mantida apenas para compatibilidade retroativa.
- **Canais**: Integração com `whatsapp-web.js`, Telegram e FB Messenger.

## Organização do Código
- O projeto é um monorepo implícito com pastas separadas para `backend`, `frontend` e `frontend-vue-3`.
- O foco de desenvolvimento de novas features deve ser sempre no `frontend-vue-3`.
