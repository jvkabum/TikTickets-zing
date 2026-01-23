---
type: doc
name: glossary
description: Terminologia técnica, conceitos de domínio e regras de negócio do TikTickets-zing
category: reference
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Glossário e Conceitos de Domínio

Este documento centraliza as definições de termos técnicos e de negócio utilizados no ecossistema do **TikTickets-zing**.

## Conceitos de Domínio (Business)

- **Tenant (Inquilino/Empresa)**: A entidade de nível mais alto. Representa uma empresa cliente que utiliza a plataforma. Todos os dados (usuários, contatos, mensagens) pertencem a um Tenant.
- **Ticket (Atendimento)**: Uma sessão de conversa ativa entre um contato e a empresa. Tem estados como `pending` (aguardando), `open` (em atendimento) e `closed` (finalizado).
- **Fila (Queue)**: Departamento ou categoria de atendimento (ex: Suporte, Financeiro, Vendas). Tickets podem ser movidos entre filas.
- **Conexão (Whatsapp Session)**: Uma instância vinculada a um número de telefone real. Uma empresa pode ter múltiplas conexões.
- **Campanha (Mass Messaging)**: O disparo agendado de mensagens para uma lista de contatos pré-definida.

## Termos Técnicos (Codebase)

- **Wbot**: Nome interno do motor que gerencia o `whatsapp-web.js`.
- **WABA**: Sigla para WhatsApp Business API (Integração oficial via 360Dialog).
- **BullMQ**: Biblioteca baseada em Redis usada para gerenciar filas de tarefas assíncronas.
- **isAuth**: Middleware central que valida tokens JWT e injeta o contexto do Tenant no objeto de requisição (`req.user.tenantId`).
- **Sequelize**: O ORM usado para mapear os modelos TypeScript para as tabelas do PostgreSQL.
- **LocalAuth**: Estratégia do WWebJS para persistir os arquivos de sessão localmente na pasta `.wwebjs_auth`.

## Personas do Sistema

| Ator | Descrição |
| :--- | :--- |
| **SaaS Admin** | Administrador global com acesso ao `/admin`. Pode criar Tenants e monitorar logs do sistema. |
| **Tenant Admin** | Gerente de uma empresa. Pode configurar filas, conexões de WhatsApp e novos atendentes. |
| **Atendente** | Usuário operacional focado na tela de chat (`/atendimento`). |
| **Robô/Chatbot** | Entidade automatizada que interage com o cliente via fluxos de resposta rápida. |

## Siglas e Abreviações
- **SPA**: Single Page Application (Frontend Vue 3).
- **CRUD**: Create, Read, Update, Delete (Operações básicas de banco).
- **QR Code**: Código escaneável para autenticar novas sessões de WhatsApp.
- **Webhook**: Gatilho HTTP enviado para sistemas externos quando um evento ocorre.

## Recursos Relacionados
- [project-overview.md](./project-overview.md)
- [architecture.md](./architecture.md)
