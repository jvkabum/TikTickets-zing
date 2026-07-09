# Arquitetura do Sistema: TikTickets-zing

> Nível de Documentação: **Completo/Detalhado** | Escala de Confiança: 🟢 CONFIRMADO

## Visão Geral

O **TikTickets-zing** é uma plataforma SaaS (Software as a Service) de atendimento omnichannel e automação, operando sob uma arquitetura **Multi-Tenant**. O sistema centraliza a comunicação de diferentes empresas (Tenants) com seus clientes através de canais como WhatsApp, Telegram, Instagram e Facebook Messenger. 

A plataforma possui um forte componente de tempo real (WebSockets) para espelhamento instantâneo de interface e um motor robusto de automação baseado em Grafos (ChatFlow) para respostas interativas.

## Pilares Tecnológicos

### Backend (Node.js + Express)
O núcleo do sistema é construído em Node.js com o framework Express.
*   **Linguagem**: TypeScript.
*   **Banco de Dados**: PostgreSQL, acessado através do ORM Sequelize.
*   **Fila de Processamento / Cache**: Redis, gerenciado pela biblioteca Bull. Crucial para envios de campanhas em massa, controle de rate-limits e comunicação assíncrona.
*   **Tempo Real**: Socket.io acoplado a um adaptador Redis (`socket.io-redis`) permitindo escala horizontal.

### Frontend (Vue 3 + Quasar)
*   **Linguagem**: Vue 3 (Composition API).
*   **UI Framework**: Quasar Framework, utilizado para uma interface responsiva, estilo Material Design.
*   **Gerência de Estado**: Pinia e Vue Query para controle eficiente de cache e mutações da interface.

### Comunicação Externa (Canais)
*   **WhatsApp**: Utiliza `whatsapp-web.js` (Baileys) rodando de forma embutida/paralela na instância do Node para o WhatsApp Web.
*   **Redes Oficiais**: Integrações Webhook para WABA (WhatsApp Business API), Telegram API e Meta Graph API (Messenger/Instagram).

## Dívidas Técnicas Identificadas

Ao longo da análise (fase de escavação e interpretação), as seguintes dívidas técnicas e pontos de atenção foram identificados:

1.  **Vazamento de Tenant no Módulo de Configurações (Settings)**:
    *   **Severidade**: 🔴 ALTA
    *   **Descrição**: O serviço `ConfiguraFechamentoTicketService` faz uso de uma Query SQL Bruta (`SELECT value FROM public."Settings" WHERE key = 'daysToClose'`) sem adicionar a cláusula `tenantId`. Isso causa um "vazamento" onde o banco reage ao primeiro registro encontrado, sobrescrevendo regras temporais e aplicando o tempo de inatividade indiscriminadamente em diferentes inquilinos.

2.  **Ausência Severa de Testes Automatizados**:
    *   **Severidade**: 🟡 MÉDIA/ALTA
    *   **Descrição**: Um projeto com 1448 arquivos possui apenas 7 arquivos de teste. A robustez das atualizações e do refatoramento fica altamente dependente de testes manuais e Quality Assurance (QA).

3.  **Processamento em Banco vs Memória**:
    *   **Severidade**: 🟡 MÉDIA
    *   **Descrição**: O módulo de estatísticas delega toda a computação de TMA e TME ao PostgreSQL (`Raw SQL`). Embora isso alivie o Event Loop do Node.js, não há camada de Cache interposta. Dashboards pesados recarregados repetidas vezes em grandes Tenants podem gargalar o banco relacional de forma desnecessária.

4.  **Processo do Wbot Embutido**:
    *   **Severidade**: 🟡 MÉDIA
    *   **Descrição**: O Node.js central gerencia as sessões do Whatsapp-Web.js na mesma máquina de estado. Uma falha de memória numa sessão específica do Wbot (Puppeteer/Baileys) pode derrubar o processo do Backend como um todo, afetando todos os Tenants. Idealmente, os bots deveriam estar num microserviço isolado.

## Multi-Tenancy (Isolamento de Inquilinos)

A arquitetura usa o modelo de "Banco de Dados Compartilhado, Esquema Compartilhado" (Shared DB, Shared Schema). O isolamento lógico dos inquilinos é garantido pela coluna compulsória `tenantId` (Chave Estrangeira) em quase todas as tabelas transacionais do sistema. 
A segurança e garantia de acesso é injetada no ciclo de vida do Express (Middlewares de Autenticação JWT), que repassam o `tenantId` autêntico aos Services e Repositories do Sequelize.
