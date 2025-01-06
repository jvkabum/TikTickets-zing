import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  Default,
  DataType,
  AllowNull
} from "sequelize-typescript";

import { format } from "date-fns";
import Contact from "./Contact";
import Message from "./Message";
import User from "./User";
import Whatsapp from "./Whatsapp";
import AutoReply from "./AutoReply";
import StepsReply from "./StepsReply";
import Queue from "./Queue";
import Tenant from "./Tenant";
import MessagesOffLine from "./MessageOffLine";
import ChatFlow from "./ChatFlow";

// Modelo para tickets (atendimentos)
// Gerencia todas as conversas/atendimentos do sistema
@Table
class Ticket extends Model<Ticket> {
  // ID único do ticket
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Status do ticket (pending, open, closed, etc)
  @Column({ defaultValue: "pending" })
  status: string;

  // Número de mensagens não lidas
  @Column
  unreadMessages: number;

  // Última mensagem do ticket
  @Column
  lastMessage: string;

  // Canal de comunicação (whatsapp, telegram, etc)
  @Column
  channel: string;

  // Indica se o ticket foi respondido
  @Default(true)
  @Column
  answered: boolean;

  // Indica se é um grupo
  @Default(false)
  @Column
  isGroup: boolean;

  // Indica se é uma demanda ativa
  @Default(false)
  @Column
  isActiveDemand: boolean;

  // Indica se é uma mensagem de despedida
  @Default(false)
  @Column
  isFarewellMessage: boolean;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Última interação com o chatbot
  @Column(DataType.DATE)
  lastInteractionBot: Date;

  // Número de tentativas do bot
  @Column(DataType.INTEGER)
  botRetries: number;

  // Timestamp de fechamento
  @Column(DataType.BIGINT)
  closedAt: number;

  // Timestamp da última mensagem
  @Column(DataType.BIGINT)
  lastMessageAt: number;

  // Timestamp do início do atendimento
  @Column(DataType.BIGINT)
  startedAttendanceAt: number;

  // ID do usuário atendente
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // ID do contato
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact)
  contact: Contact;

  // ID da conexão WhatsApp
  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  // Relacionamento com o WhatsApp
  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  // Mensagens do ticket
  @HasMany(() => Message)
  messages: Message[];

  // ID da resposta automática
  @ForeignKey(() => AutoReply)
  @Column
  autoReplyId: number;

  // Relacionamento com resposta automática
  @BelongsTo(() => AutoReply)
  autoReply: AutoReply;

  // ID do passo da resposta automática
  @ForeignKey(() => StepsReply)
  @Column
  stepAutoReplyId: number;

  // Relacionamento com o passo
  @BelongsTo(() => StepsReply)
  stepsReply: StepsReply;

  // ID do fluxo de chat
  @ForeignKey(() => ChatFlow)
  @Column
  chatFlowId: number;

  // Relacionamento com o fluxo
  @BelongsTo(() => ChatFlow)
  chatFlow: ChatFlow;

  // Passo atual do fluxo de chat
  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  stepChatFlow: number;

  // ID da fila
  @ForeignKey(() => Queue)
  @Default(null)
  @AllowNull
  @Column
  queueId: number;

  // Relacionamento com a fila
  @BelongsTo(() => Queue)
  queue: Queue;

  // ID do tenant
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Indica se é uma transferência
  @Default(null)
  @Column(DataType.VIRTUAL)
  isTransference: string | boolean | null;

  // Indica se acabou de ser criado
  @Default(null)
  @Column(DataType.VIRTUAL)
  isCreated: boolean | null;

  // Mensagens agendadas
  @Default([])
  @Column(DataType.VIRTUAL)
  scheduledMessages: Message[];

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Mensagens offline
  @HasMany(() => MessagesOffLine)
  messagesOffLine: MessagesOffLine[];

  // Configurações da API
  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  apiConfig: object;

  // Número de protocolo do ticket
  // Formato: yyyyddMMHHmmss + id
  @Column(DataType.VIRTUAL)
  get protocol(): string {
    const date = this.getDataValue("createdAt");
    const formatDate = format(new Date(date), "yyyyddMMHHmmss");
    const id = this.getDataValue("id");
    return `${formatDate}${id}`;
  }
}

export default Ticket;
