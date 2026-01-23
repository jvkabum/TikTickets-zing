---
type: doc
name: project-overview
description: Visão geral da plataforma TikTickets-zing v4 Enterprise (Multi-atendimento)
category: overview
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# TikTickets-zing v4 Enterprise

Bem-vindo ao ecossistema de documentação do **TikTickets-zing**, a plataforma definitiva para automação de atendimento e gestão multi-tenant de canais de mensageria.

## O que é o Projeto?
O TikTickets-zing é um sistema de atendimento centralizado que permite a empresas gerenciarem múltiplas contas de **WhatsApp, Telegram, Messenger e Instagram** em uma única interface moderna e rápida.

### Diferenciais Competitivos
- **Multi-Tenancy Nativo**: Uma única instalação pode atender centenas de empresas diferentes com isolamento total de dados.
- **Motor de Conversão Vue 3**: Interface rica, animada e responsiva construída em Quasar.
- **Estabilidade Wbot**: Implementação customizada do `whatsapp-web.js` com watchdog de conexão e mecanismos de auto-recuperação.
- **Processamento Assíncrono**: Uso intensivo de BullMQ para evitar gargalos em disparos de massa e integrações externas.

## Visão Geral da Stack

| Tecnologia | Função |
| :--- | :--- |
| **Node.js + TS** | Motor do Backend e lógica de canais. |
| **Vue 3.5 + Quasar** | Frontend SPA de alto desempenho. |
| **PostgreSQL** | Persistência de dados altamente estruturada. |
| **Redis** | Gestão de filas (BullMQ) e cache de sessões Socket. |
| **Puppeteer** | Emulação de clientes WhatsApp Web (Wbot). |

## Níveis de Acesso
1.  **Admin do Sistema (SaaS Admin)**: Gerencia os Tenants, cria novas empresas e monitora a saúde das conexões.
2.  **Admin da Empresa (Manager)**: Configura filas, usuários, respostas rápidas e canais da sua organização.
3.  **Agente (Atendente)**: Focado na operação de chat, gestão de tickets e acompanhamento de clientes.

## Estrutura de Documentação
Para navegar no projeto, utilize os guias abaixo:
- 🏗️ **[Arquitetura](./architecture.md)** — Entenda o coração do backend e das filas.
- 📡 **[API Reference](./api.md)** — Documentação de endpoints e integrações externas.
- 🔄 **[Fluxo de Dados](./data-flow.md)** — O ciclo de vida de uma mensagem.
- 🛡️ **[Segurança](./security.md)** — Como protegemos os dados dos Tenants.
- 🛠️ **[Tooling](./tooling.md)** — Dicas de produtividade e setup de ambiente.

## Próximos Passos
Se você é um desenvolvedor novo, recomendamos começar pelo **[Guia de Início Rápido (Getting Started)](./getting-started.md)**.
