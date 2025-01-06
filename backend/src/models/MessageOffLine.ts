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
  AutoIncrement
} from "sequelize-typescript";
import Contact from "./Contact";
import Message from "./Message";
import Ticket from "./Ticket";
import User from "./User";

// Modelo que armazena mensagens recebidas quando o usuário está offline
// Mantém o histórico de comunicação mesmo quando o destinatário não está disponível
@Table({ freezeTableName: true })
class MessagesOffLine extends Model<MessagesOffLine> {
  // ID único da mensagem offline
  // Gerado automaticamente para cada nova mensagem
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Status de confirmação da mensagem
  // 0: Enviada, 1: Entregue, 2: Lida
  @Default(0)
  @Column
  ack: number;

  // Indica se a mensagem foi lida
  // Usado para controle de notificações
  @Default(false)
  @Column
  read: boolean;

  // Indica se a mensagem foi enviada pelo usuário atual
  // Diferencia mensagens enviadas e recebidas
  @Default(false)
  @Column
  fromMe: boolean;

  // Conteúdo da mensagem
  // Armazena o texto da mensagem
  @Column(DataType.TEXT)
  body: string;

  // Nome do arquivo de mídia
  // Campo virtual que retorna o nome do arquivo
  @Column(DataType.VIRTUAL)
  get mediaName(): string | null {
    return this.getDataValue("mediaUrl");
  }

  // URL completa do arquivo de mídia
  // Constrói a URL pública para acesso ao arquivo
  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      const { BACKEND_URL } = process.env;
      const value = this.getDataValue("mediaUrl");
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  // Tipo de mídia anexada
  // Ex: imagem, vídeo, áudio, documento
  @Column
  mediaType: string;

  // Indica se a mensagem foi excluída
  // Mantém o registro mas marca como removido
  @Default(false)
  @Column
  isDeleted: boolean;

  // Data e hora da criação da mensagem
  // Preenchido automaticamente ao criar
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data e hora da última atualização
  // Atualizado ao modificar a mensagem
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // ID da mensagem que está sendo respondida
  // Permite criar threads de conversação
  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  // Relacionamento com a mensagem citada
  // Acesso aos detalhes da mensagem original
  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  // ID do ticket relacionado
  // Vincula a mensagem a um atendimento
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  // Relacionamento com o ticket
  // Acesso aos detalhes do atendimento
  @BelongsTo(() => Ticket)
  ticket: Ticket;

  // ID do contato que enviou/recebeu
  // Identifica o participante da conversa
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  // Acesso aos detalhes do participante
  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  // ID do usuário relacionado
  // Identifica o agente envolvido
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  // Acesso aos detalhes do agente
  @BelongsTo(() => User)
  user: User;

  tableName: "MessagesOffLine";
}

/**
 * MessagesOffLine model represents messages received when a user is offline.
 * It includes details about the message, such as its content, sender,
 * and associated ticket and contact information. This model is used to
 * manage offline messages and their relationships with other entities.
 */
export default MessagesOffLine;
