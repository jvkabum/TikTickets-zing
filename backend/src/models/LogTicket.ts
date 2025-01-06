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
  AllowNull,
  AutoIncrement
} from "sequelize-typescript";
import Ticket from "./Ticket";
import User from "./User";
import Queue from "./Queue";

// Modelo que registra todas as alterações e ações realizadas em tickets
// Usado para manter um histórico completo de cada ticket no sistema
@Table
class LogTicket extends Model<LogTicket> {
  // ID único do registro de log
  // Gerado automaticamente para cada nova entrada
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Tipo de ação realizada no ticket
  // Exemplos: criação, atualização, transferência, fechamento
  @Column(DataType.TEXT)
  type: string;

  // Data e hora da criação do registro
  // Preenchido automaticamente quando o log é criado
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data e hora da última atualização
  // Atualizado automaticamente quando o log é modificado
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // ID do ticket relacionado ao log
  // Cada log deve estar associado a um ticket específico
  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  // Relacionamento com o ticket
  // Permite acessar os detalhes completos do ticket
  @BelongsTo(() => Ticket)
  ticket: Ticket;

  // ID do usuário que realizou a ação
  // Pode ser nulo em casos de ações automáticas do sistema
  @ForeignKey(() => User)
  @Default(null)
  @AllowNull
  @Column
  userId: number;

  // Relacionamento com o usuário
  // Permite identificar quem realizou cada ação no ticket
  @BelongsTo(() => User)
  user: User;

  // ID da fila associada ao ticket no momento da ação
  // Importante para rastrear movimentações entre filas
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  // Relacionamento com a fila
  // Permite acessar detalhes da fila onde a ação ocorreu
  @BelongsTo(() => Queue)
  queue: Queue;
}

/**
 * LogTicket model represents the log entries for support tickets.
 * It includes information about the ticket, the user who created the log,
 * and the queue associated with the ticket. This model is used to track
 * changes and actions taken on support tickets over time.
 */
export default LogTicket;
