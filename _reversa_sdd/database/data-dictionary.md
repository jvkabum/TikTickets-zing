# Dicionário de Dados

> 🟡 Inferido de ORM

## Tabela: ApiConfig

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| sessionId | number | |
| name | string | |
| isActive | boolean | |
| token | string | |
| authToken | string | |
| urlServiceStatus | string | |
| urlMessageStatus | string | |
| userId | number | |
| createdAt | Date | |
| updatedAt | Date | |
| tenantId | number | |

## Tabela: ApiMessage

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| sessionId | number | |
| ack | number | |
| messageId | string | |
| body | string | |
| number | string | |
| mediaName | string | |
| mediaUrl | string | |
| externalKey | string | |
| timestamp | number | |
| messageWA | object | |
| apiConfig | object | |
| createdAt | Date | |
| updatedAt | Date | |
| tenantId | number | |

## Tabela: AutoReply

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| name | string | |
| celularTeste | string | |
| isActive | boolean | |
| action | number | |
| userId | number | |
| createdAt | Date | |
| updatedAt | Date | |
| tenantId | number | |

## Tabela: AutoReplyLogs

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| autoReplyId | string | |
| autoReplyName | string | |
| stepsReplyId | string | |
| stepsReplyMessage | string | |
| wordsReply | string | |
| ticketId | number | |
| contactId | number | |
| createdAt | Date | |
| updatedAt | Date | |

## Tabela: Campaign

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| name | string | |
| start | Date | |
| end | Date | |
| status | string | |
| message1 | string | |
| message2 | string | |
| message3 | string | |
| mediaType | string | |
| mediaType2 | string | |
| mediaType3 | string | |
| userId | number | |
| sessionId | number | |
| tenantId | number | |
| delay | number | |
| totalMessages | number | |
| sentMessages | number | |
| failedMessages | number | |

## Tabela: CampaignContacts

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| ack | number | |
| body | string | |
| messageRandom | string | |
| mediaName | string | |
| timestamp | number | |
| messageId | string | |
| campaignId | string | |
| contactId | number | |

## Tabela: ChatFlow

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| name | string | |
| isActive | boolean | |
| isDeleted | boolean | |
| celularTeste | string | |
| userId | number | |
| tenantId | number | |
| createdAt | Date | |
| updatedAt | Date | |

## Tabela: Contact

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| name | string | |
| number | string | |
| email | string | |
| profilePicUrl | string | |
| pushname | string | |
| telegramId | string | |
| messengerId | string | |
| instagramPK | number | |
| isUser | boolean | |
| isWAContact | boolean | |
| isGroup | boolean | |
| tenantId | number | |

## Tabela: ContactCustomField

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| name | string | |
| value | string | |
| contactId | number | |

## Tabela: ContactTag

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| contactId | number | |
| tagId | number | |
| tenantId | number | |

## Tabela: ContactWallet

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| contactId | number | |
| walletId | number | |
| tenantId | number | |

## Tabela: FastReply

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| key | string | |
| message | string | |
| userId | number | |
| tenantId | number | |
| type | DataType.JSON, | |

## Tabela: LogTicket

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| type | string | |
| createdAt | Date | |
| updatedAt | Date | |
| ticketId | number | |
| userId | number | |
| queueId | number | |

## Tabela: Message

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| messageId | string | |
| ack | number | |
| status | string | |
| wabaMediaId | string | |
| read | boolean | |
| fromMe | boolean | |
| body | string | |
| type | DataType.STRING, | |
| mediaType | string | |
| isDeleted | boolean | |
| createdAt | Date | |
| updatedAt | Date | |
| edited | string | |
| quotedMsgId | string | |
| ticketId | number | |
| contactId | number | |
| timestamp | number | |
| userId | number | |
| scheduleDate | Date | |
| sendType | string | |
| tenantId | number | |
| idFront | string | |
| pollData | { | |

## Tabela: MessagesOffLine

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| ack | number | |
| read | boolean | |
| fromMe | boolean | |
| body | string | |
| Ex | imagem, vídeo, áudio, documento | |
| isDeleted | boolean | |
| createdAt | Date | |
| updatedAt | Date | |
| quotedMsgId | string | |
| ticketId | number | |
| contactId | number | |
| userId | number | |

## Tabela: Protocol

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |

## Tabela: Queue

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| queue | string | |
| isActive | boolean | |
| userId | number | |
| tenantId | number | |

## Tabela: Setting

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| key | string | |
| value | string | |
| tenantId | number | |

## Tabela: StepsReply

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| reply | string | |
| initialStep | boolean | |
| idAutoReply | number | |
| userId | number | |
| createdAt | Date | |
| updatedAt | Date | |

## Tabela: StepsReplyActions

| Campo | Tipo | Descrição |
|---|---|---|
| id | string | |
| stepReplyId | number | |
| words | string | |
| replyDefinition | string | |
| action | number | |
| userId | number | |
| createdAt | Date | |
| updatedAt | Date | |
| queueId | number | |
| userIdDestination | number | |
| nextStepId | number | |

## Tabela: Tags

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| tag | string | |
| color | string | |
| isActive | boolean | |
| userId | number | |
| autoTag | string | |
| tenantId | number | |

## Tabela: Tenant

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| defaultValue | "active" ) | |
| name | string | |
| ownerId | number | |
| businessHours | [] | |
| messageBusinessHours | string | |
| maxUsers | number | |
| maxConnections | number | |

## Tabela: Ticket

| Campo | Tipo | Descrição |
|---|---|---|
| defaultValue | "pending" ) | |
| type | DataType.INTEGER, | |

## Tabela: TicketLog

| Campo | Tipo | Descrição |
|---|---|---|
| (Nenhum campo explícito mapeado) | | |

## Tabela: User

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| name | string | |
| email | string | |
| status | string | |
| password | string | |
| passwordHash | string | |
| tokenVersion | number | |
| profile | string | |
| tenantId | number | |
| lastLogin | Date | |
| lastOnline | Date | |
| lastLogout | Date | |
| isOnline | boolean | |
| configs | object | |

## Tabela: UserMessagesLog

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| userId | number | |
| messageId | string | |
| ticketId | number | |
| createdAt | Date | |
| updatedAt | Date | |

## Tabela: UsersQueues

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| queueId | number | |
| userId | number | |

## Tabela: Whatsapp

| Campo | Tipo | Descrição |
|---|---|---|
| id | number | |
| name | string | |
| session | string | |
| qrcode | string | |
| status | string | |
| battery | string | |
| plugged | boolean | |
| profilePicUrl | string | |
| isActive | boolean | |
| isDeleted | boolean | |
| retries | number | |
| isDefault | boolean | |
| tokenTelegram | string | |
| instagramUser | string | |
| instagramKey | string | |
| fbPageId | string | |
| fbObject | object | |
| type | string | |
| number | string | |
| phone | object | |
| tenantId | number | |
| chatFlowId | number | |
| wabaBSP | string | |
| tokenAPI | string | |
| tokenHook | string | |
| farewellMessage | string | |
| instance | Whatsapp & any): Promise<void> { | |

