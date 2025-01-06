import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  ForeignKey,
  AutoIncrement
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";

// Modelo para logs de respostas automáticas
// Registra o histórico de todas as respostas automáticas enviadas
@Table({ freezeTableName: true })
class AutoReplyLogs extends Model<AutoReplyLogs> {
  // ID único do log
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  // ID da resposta automática relacionada
  @Column
  autoReplyId: string;

  // Nome da resposta automática
  @Column(DataType.TEXT)
  autoReplyName: string;

  // ID do passo da resposta
  @Column
  stepsReplyId: string;

  // Mensagem enviada neste passo
  @Column(DataType.TEXT)
  stepsReplyMessage: string;

  // Palavras-chave que ativaram a resposta
  @Column(DataType.TEXT)
  wordsReply: string;

  // ID do ticket relacionado
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  // Relacionamento com o ticket
  @BelongsTo(() => Ticket)
  ticket: Ticket;

  // ID do contato que recebeu a resposta
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  // Data de criação do registro
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // Nome da tabela no banco de dados
  tableName: "AutoReplyLogs";
}

export default AutoReplyLogs;
