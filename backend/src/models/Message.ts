import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AllowNull
} from "sequelize-typescript";
import { v4 as uuidV4 } from "uuid";
import Contact from "./Contact";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import User from "./User";

// Modelo para mensagens
// Gerencia todas as mensagens trocadas no sistema
@Table
class Message extends Model<Message> {
  // ID único da mensagem
  @PrimaryKey
  @Default(uuidV4)
  @Column
  id: string;

  // ID da mensagem na plataforma (WhatsApp, etc)
  @Default(null)
  @AllowNull
  @Column
  messageId: string;

  // Status de confirmação da mensagem
  // 0: Pendente, 1: Enviado, 2: Recebido, 3: Lido, etc
  @Default(0)
  @Column
  ack: number;

  // Status de envio da mensagem
  @Default(null)
  @AllowNull
  @Column(DataType.ENUM("pending", "sended", "received"))
  status: string;

  // ID da mídia no WhatsApp Business API
  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  wabaMediaId: string;

  // Indica se a mensagem foi lida
  @Default(false)
  @Column
  read: boolean;

  // Indica se a mensagem foi enviada pelo usuário
  @Default(false)
  @Column
  fromMe: boolean;

  // Conteúdo da mensagem
  @Column(DataType.TEXT)
  body: string;

  // Nome do arquivo de mídia
  @Column(DataType.VIRTUAL)
  get mediaName(): string | null {
    return this.getDataValue("mediaUrl");
  }

  // URL da mídia com caminho completo
  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      const { BACKEND_URL } = process.env;
      const value = this.getDataValue("mediaUrl");
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  // Tipo de mídia (imagem, vídeo, áudio, etc)
  @Column
  mediaType: string;

  // Indica se a mensagem foi deletada
  @Default(false)
  @Column
  isDeleted: boolean;

  // Data de criação do registro
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // Conteúdo editado da mensagem
  @Column(DataType.TEXT)
  edited: string;

  // ID da mensagem citada (se for resposta)
  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  // Relacionamento com a mensagem citada
  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  // ID do ticket associado
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  // Relacionamento com o ticket
  @BelongsTo(() => Ticket)
  ticket: Ticket;

  // ID do contato
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  // Timestamp da mensagem
  @Default(null)
  @AllowNull
  @Column(DataType.BIGINT)
  timestamp: number;

  // ID do usuário que enviou
  @ForeignKey(() => User)
  @Default(null)
  @AllowNull
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // Data agendada para envio
  @Default(null)
  @AllowNull
  @Column(DataType.DATE)
  scheduleDate: Date;

  // Tipo de envio da mensagem
  @Default(null)
  @AllowNull
  @Column(
    DataType.ENUM("campaign", "chat", "external", "schedule", "bot", "sync", "API")
  )
  sendType: string;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // ID para referência no frontend
  @Default(null)
  @AllowNull
  @Column
  idFront: string;
}

export default Message;
