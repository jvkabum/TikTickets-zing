# Dicionário de Dados

## Módulo: `auth` (Entidade: `User`)

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `id` | number | Sim | Auto | ID único do usuário |
| `name` | string | Sim | - | Nome completo |
| `email` | string | Sim | - | E-mail usado para login |
| `status` | string | Sim | - | Status do usuário |
| `passwordHash`| string | Sim | - | Hash Bcrypt da senha (armazenado) |
| `password` | string | Não | - | Campo virtual para senha em texto plano |
| `tokenVersion`| number | Não | 0 | Usado para invalidar tokens JWT antigos |
| `profile` | string | Não | "admin"| Perfil de acesso do usuário |
| `tenantId` | number | Sim | - | FK apontando para a tabela Tenant |
| `lastLogin` | Date | Não | - | Timestamp do último login bem sucedido |
| `lastOnline` | Date | Não | - | Timestamp de presença |
| `lastLogout` | Date | Não | - | Timestamp do último logout |
| `isOnline` | boolean| Não | - | Flag indicadora de presença em tempo real |
| `configs` | json | Não | {} | Configurações personalizadas por usuário |

## Módulo: `tenants` (Entidade: `Tenant`)

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `id` | number | Sim | Auto | ID único do tenant |
| `status` | string | Não | "active"| Status de ativação da empresa |
| `name` | string | Sim | - | Nome da empresa/organização |
| `ownerId` | number | Sim | - | FK apontando para o Usuário proprietário (`User`) |
| `businessHours` | jsonb | Não | [] | Array de configurações diárias de funcionamento |
| `messageBusinessHours`| string | Não | - | Mensagem de ausência para fora do expediente |
| `maxUsers` | number | Não | - | Cota máxima de usuários na plataforma |
| `maxConnections`| number | Não | - | Cota máxima de canais de atendimento simultâneos |

## Módulo: `users` (Entidade Pivot: `UsersQueues`)

> A entidade principal `User` já foi coberta no módulo `auth`.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `userId` | number | Sim | - | FK apontando para `User` |
| `queueId` | number | Sim | - | FK apontando para `Queue` (Fila de Atendimento) |
| `createdAt`| Date | Não | Auto | Data/Hora da vinculação |
| `updatedAt`| Date | Não | Auto | Data/Hora da última atualização |

## Módulo: `tickets` (Entidades: `Ticket`, `Protocol`, `LogTicket`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Ticket` | `id` | number | PK (Auto) |
| `Ticket` | `status` | string | Status do ciclo de vida: "pending", "open", "closed" |
| `Ticket` | `unreadMessages`| number | Total de mensagens não lidas no lado do operador |
| `Ticket` | `lastMessage` | string | Cópia redundante do texto da última interação |
| `Ticket` | `isGroup` | boolean | Determina se o atendimento advém de um grupo WhatsApp |
| `Ticket` | `isActiveDemand`| boolean | Determina se o atendimento foi iniciado ativamente pelo operador |
| `Ticket` | `isFarewellMessage`| boolean| Flag indicadora de que a mensagem de despedida já foi agendada/enviada |
| `Ticket` | `attendanceCount`| number | Quantidade de vezes que esse contato foi atendido nesse ticket |
| `Protocol`| `protocolNumber`| string | String alfa-numérica unívoca de protocolo para apresentação ao cliente |
| `Protocol`| `status` | string | Fase do protocolo ("ABER" ou "FECH") |
| `LogTicket`| `type` | string | Categoria ou ação do histórico ("access", "create", "transfer") |
| `LogTicket`| `ticketId` | number | FK apontando para `Ticket` a qual a auditoria pertence |

## Módulo: `contacts` (Entidades: `Contact`, `ContactCustomField`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Contact`| `id` | number | PK (Auto) |
| `Contact`| `name` | string | Nome de exibição do contato |
| `Contact`| `number` | string | Chave de telefone higienizada (somente dígitos) |
| `Contact`| `profilePicUrl`| string| Link de cache da imagem do avatar original |
| `Contact`| `pushname` | string | Nome de perfil exibido dentro do aplicativo móvel |
| `Contact`| `telegramId` | string | ID de rede exclusivo do usuário no Telegram |
| `Contact`| `instagramPK`| number | Primary Key nativa do usuário no Instagram |
| `Contact`| `isGroup` | boolean| Flag indicadora se o contato é um nó/sala de Grupo |
| `ContactCustomField`| `name` | string | Label ou chave do atributo extra (ex: "CPF") |
| `ContactCustomField`| `value`| string | Valor preenchido ("000.000.000-00") |

## Módulo: `queues` (Entidade: `Queue`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Queue`  | `id` | number | PK (Auto) |
| `Queue`  | `queue` | string | Nome de exibição da fila de atendimento (ex: "Suporte") |
| `Queue`  | `isActive` | boolean | Flag que determina se novos tickets podem ser distribuídos aqui |
| `Queue`  | `userId` | number | FK do usuário (Admin) responsável por criar ou modificar a fila |

## Módulo: `chatflow` (Entidade: `ChatFlow`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `ChatFlow` | `id` | number | PK (Auto) |
| `ChatFlow` | `name` | string | Nome da árvore de decisão / bot |
| `ChatFlow` | `flow` | json | Objeto vetorial complexo com `nodeList` (condições) e `lineList` (conexões) |
| `ChatFlow` | `isActive`| boolean| Flag determinando se o fluxo está operante |
| `ChatFlow` | `isDeleted`| boolean| Soft delete do fluxo |
| `ChatFlow` | `celularTeste`| string | Número DDI+DDD opcional restrito para QA homologação |
| `ChatFlow` | `userId` | number | Operador admin criador do fluxo |

## Módulo: `channels` (Entidade: `Whatsapp`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Whatsapp` | `id` | number | PK (Auto) |
| `Whatsapp` | `name` | string | Nome de exibição da conexão (ex: "Número Financeiro") |
| `Whatsapp` | `session` | string | String representativa da sessão no Baileys/Whatsapp |
| `Whatsapp` | `qrcode` | string | String base64 ou hash representando o QR Code de autenticação |
| `Whatsapp` | `status` | string | Enum implícito de Status ("CONNECTED", "DISCONNECTED", "OPENING", etc) |
| `Whatsapp` | `type` | string | ENUM ("whatsapp", "telegram", "instagram", "messenger", "waba") |
| `Whatsapp` | `isDefault`| boolean | Determina se esta é a linha principal de saída do sistema |
| `Whatsapp` | `tokenHook`| string | JWT gerado automaticamente e injetado nos callbacks de provedores oficiais |
| `Whatsapp` | `chatFlowId`| number | FK indicando qual Bot (Chatflow) atende as mensagens novas desta linha |
| `Whatsapp` | `tenantId` | number | FK da empresa proprietária desta linha telefônica/social |

## Módulo: `campaigns` (Entidades: `Campaign`, `CampaignContacts`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Campaign` | `id` | number | PK (Auto) |
| `Campaign` | `name` | string | Nome de controle interno da campanha |
| `Campaign` | `status`| enum | "pending", "scheduled", "processing", "canceled", "finished" |
| `Campaign` | `message1/2/3`| string | Textos alternativos preenchidos em tela para rotação anti-spam no envio |
| `Campaign` | `mediaUrl` | string | Caminho de anexo principal |
| `Campaign` | `delay` | number | Frequência estipulada de intervalo seguro entre os disparos da lista |
| `CampaignContacts` | `id` | number | PK (Auto) |
| `CampaignContacts` | `ack` | number | Status da fatura individual da mensagem (0=Pendente, 1=Env, 2=Rec, 3=Lida) |
| `CampaignContacts` | `messageRandom` | string | Informa qual variação A/B/C foi escolhida aleatoriamente ("message1", etc) |

## Módulo: `fast-replies` (Entidade: `FastReply`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `FastReply` | `id` | number | PK (Auto) |
| `FastReply` | `key` | string | Gatilho acionador textual (ex: "#pix") |
| `FastReply` | `message` | string | Corpo predefinido do texto alvo |
| `FastReply` | `medias` | json | Array validador nativo de strings contendo as URLs absolutas |
| `FastReply` | `userId` | number | FK do operador que desenhou o atalho |
| `FastReply` | `tenantId` | number | FK bloqueando a resposta rápida exclusivamente à empresa logada |

## Módulo: `settings` (Entidade: `Setting`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Setting` | `id` | number | PK (Auto) |
| `Setting` | `key` | string | Nome de sistema do parâmetro (ex: "chatbot_active") |
| `Setting` | `value` | string | Valor estrutural flexível salvo sempre como string/varchar |
| `Setting` | `tenantId` | number | FK identificando a qual empresa a regra de negócio se aplica |

## Módulo: `statistics` (Sem entidade nova, apenas consumo de Views)

Nenhuma tabela é criada. Este módulo atua como uma **camada analítica**. Extrai inteligência gerando projeções virtuais através de SQL Raw, consumindo dados transacionais massivos de `Tickets` e `LogTickets`.

| Output Projetado | Tipo Resultante | Origem | Descrição |
|------------------|-----------------|--------|-----------|
| `TMA` | number (interval) | `Tickets.closedAt` - `createdAt` | Tempo Médio de Atendimento Geral |
| `TME` | number (interval) | `Tickets.startedAttendanceAt` - `createdAt` | Tempo Médio de Espera (Fila) |
| `qtd_demanda_ativa` | number | `Tickets.isActiveDemand` | Chamados outbound iniciados pelos operadores |
| `qtd_demanda_receptiva` | number | `Tickets.isActiveDemand` | Chamados inbound iniciados pelos clientes |

## Módulo: `api-integration` (Entidade: `ApiConfig`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `ApiConfig` | `id` | uuid | PK em UUIDv4 para segurança em endpoints públicos |
| `ApiConfig` | `sessionId` | number | FK travando o token a disparar apenas num celular específico |
| `ApiConfig` | `token` | string | Token de acesso para validação em Middlewares Bearer |
| `ApiConfig` | `tenantId` | number | FK de segurança que impede cross-tenant API injection |

## Módulo: `tags` (Entidade: `Tags`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Tags` | `id` | number | PK (Auto) |
| `Tags` | `tag` | string | Nome/texto da tag (ex: "Urgente") |
| `Tags` | `color` | string | Cor da tag em formato hexadecimal |
| `Tags` | `isActive` | boolean | Status de ativação |
| `Tags` | `autoTag` | string | Indicador se a tag é automática e seu gatilho |
| `Tags` | `tenantId` | number | FK da empresa proprietária |

## Módulo: `auto-replies` (Entidades: `AutoReply`, `StepsReply`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `AutoReply` | `id` | number | PK (Auto) |
| `AutoReply` | `name` | string | Nome da árvore de resposta |
| `AutoReply` | `celularTeste` | string | Número exclusivo para testes da árvore |
| `AutoReply` | `action` | number | Tipo de ação a ser executada |
| `StepsReply` | `id` | number | PK (Auto) |
| `StepsReply` | `reply` | string | Texto ou payload do passo da resposta |
| `StepsReply` | `initialStep` | boolean | Flag determinando se este é o passo inicial |

## Módulo: `messages` (Entidade: `Message`)

| Entidade | Campo | Tipo | Descrição |
|----------|-------|------|-----------|
| `Message` | `id` | string | PK (UUIDv4) |
| `Message` | `messageId` | string | ID de rede real gerado pelo provedor (ex: Meta) |
| `Message` | `ack` | number | Status numérico de confirmação (0 a 3) |
| `Message` | `status` | enum | "pending", "sended", "received" |
| `Message` | `read` | boolean | Se foi lida pelo destinatário |
| `Message` | `fromMe` | boolean | Se partiu do próprio sistema em vez do cliente |
| `Message` | `body` | string | Corpo de texto da mensagem |
| `Message` | `sendType` | enum | "campaign", "chat", "external", "schedule", "bot", "sync", "API" |
| `Message` | `pollData` | jsonb | Enquete interativa (opções e votos) |
| `Message` | `ticketId` | number | FK do Ticket dono do histórico |
| `Message` | `quotedMsgId`| string | Auto-FK. Resposta referencial a uma mensagem anterior |
