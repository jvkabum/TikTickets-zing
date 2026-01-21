# Documentação Completa da API (REST)

O backend do TikTickets-zing expõe uma API RESTful robusta para gestão de multi-atendimento WhatsApp, automação e administração multi-tenant.

## Padrões Globais
- **Base URL**: `http://localhost:8080`
- **Autenticação**: A maioria das rotas requer Header `Authorization: Bearer <TOKEN>`.
- **Isolamento**: O `tenantId` é injetado automaticamente via middleware `isAuth`.

---

## 1. Autenticação (`/auth`)
Gerencia o acesso ao sistema.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/auth/signup` | Registro de novo usuário |
| POST | `/auth/login` | Login e obtenção de token |
| POST | `/auth/logout` | Encerramento de sessão |
| POST | `/auth/refresh_token` | Renovação do token JWT |

---

## 2. Usuários (`/users`)
Gestão de agentes e administradores por tenant.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/users` | Lista usuários do tenant |
| POST | `/users` | Cria novo usuário |
| GET | `/users/:userId` | Detalhes de um usuário |
| PUT | `/users/:userId` | Atualiza usuário |
| DELETE| `/users/:userId` | Remove usuário |
| PUT | `/users/:userId/configs`| Atualiza configurações do usuário |

---

## 3. WhatsApp & Sessões (`/whatsapp`)
Controle das instâncias e conexões.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/whatsapp` | Lista conexões do tenant |
| POST | `/whatsapp` | Cria nova conexão |
| GET | `/whatsapp/:id` | Detalhes da conexão |
| PUT | `/whatsapp/:id` | Atualiza conexão |
| DELETE| `/whatsapp/:id` | Remove conexão (Soft delete) |
| POST | `/whatsappsession/:id` | Inicia/Gera QR Code da sessão |
| PUT | `/whatsappsession/:id` | Atualiza/Reinicia sessão |
| DELETE| `/whatsappsession/:id` | Desconecta/Logout do WhatsApp |

---

## 4. Tickets (`/tickets`)
Coração do sistema de atendimento.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/tickets` | Lista tickets ativos/pendentes |
| POST | `/tickets` | Cria novo ticket manualmente |
| GET | `/tickets/:id` | Detalhes do ticket |
| PUT | `/tickets/:id` | Atualiza status/fila do ticket |
| DELETE| `/tickets/:id` | Remove ticket |
| GET | `/tickets/:id/logs` | Histórico de eventos do ticket |
| POST | `/tickets/:id/sync` | Sincroniza mensagens do ticket |

---

## 5. Contatos (`/contacts`)
Gestão da base de clientes.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/contacts` | Lista contatos |
| POST | `/contacts` | Cria novo contato |
| GET | `/contacts/:id` | Detalhes do contato |
| PUT | `/contacts/:id` | Atualiza contato |
| DELETE| `/contacts/:id` | Remove contato |
| POST | `/contacts/import` | Importa contatos do telefone |
| POST | `/contacts/upload` | Upload massivo via arquivo |
| POST | `/contacts/export` | Exporta base de contatos |
| PUT | `/contact-tags/:id` | Atualiza tags do contato |
| PUT | `/contact-wallet/:id` | Atualiza carteira (consultor) do contato |

---

## 6. Mensageria (`/messages`)
Troca de informações em tempo real.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/messages/:ticketId` | Busca mensagens de um ticket |
| POST | `/messages/:ticketId` | Envia mensagem (Texto/Mídia) |
| POST | `/forward-messages` | Encaminha mensagens |
| DELETE| `/messages/:id` | Apaga mensagem (Unsend) |
| POST | `/messages/edit/:id` | Edita mensagem enviada |

---

## 7. Automação & Fluxos
Respostas rápidas, Auto-reply e Chatbots.

### Respostas Rápidas (`/fastreply`)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/fastreply` | Lista respostas rápidas |
| POST | `/fastreply` | Cria nova resposta rápida |
| PUT | `/fastreply/:id` | Atualiza resposta rápida |
| DELETE| `/fastreply/:id` | Remove resposta rápida |

### Auto-Reply (Chatbot de Passos)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/auto-reply` | Lista chatbots |
| POST | `/auto-reply` | Cria novo chatbot |
| POST | `/auto-reply/:id/steps` | Adiciona passo ao fluxo |
| POST | `/auto-reply-action` | Cria ação (ex: transferir) no passo |

### ChatFlow (Visual)
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/chat-flow` | Lista fluxos visuais |
| POST | `/chat-flow` | Cria novo fluxo |

---

## 8. Campanhas (`/campaigns`)
Disparos em massa.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/campaigns` | Lista campanhas |
| POST | `/campaigns` | Cria nova campanha (com mídias) |
| POST | `/campaigns/start/:id` | Inicia disparo da campanha |
| POST | `/campaigns/cancel/:id`| Cancela disparo |
| GET | `/campaigns/contacts/:id`| Lista contatos da campanha |

---

## 9. Administração (`/admin`)
Exclusivo para o `isAuthAdmin`.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/admin/users` | Lista todos os usuários do sistema |
| GET | `/admin/tenants` | Lista todas as empresas (tenants) |
| POST | `/admin/tenants` | Cria nova empresa |
| DELETE| `/admin/tenants/:id` | Remove empresa |
| GET | `/admin/channels` | Lista todos os canais do sistema |

---

## 10. API Externa (`/v1/api/external`)
Integração via Token de API.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/v1/api/external/:apiId` | Envia mensagem externa |
| POST | `/v1/api/external/:apiId/start-session` | Inicia sessão remotamente |

---

## 11. Estatísticas & Dashboards
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/dash-tickets-queues` | Dados de tickets por fila |
| GET | `/statistics-per-users` | Performance por agente |
| GET | `/statistics-tickets-times`| Tempos médios de resposta/espera |
| GET | `/contacts-report` | Relatório detalhado de contatos |
