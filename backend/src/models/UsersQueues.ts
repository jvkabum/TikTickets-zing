import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";
import User from "./User";
import Queue from "./Queue";

// Modelo para relacionamento entre usuários e filas
// Tabela de junção para relacionamento muitos-para-muitos
@Table({ freezeTableName: true })
class UsersQueues extends Model<UsersQueues> {
  // ID único do relacionamento
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // ID da fila
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  // Relacionamento com a fila
  @BelongsTo(() => Queue)
  queue: Queue;

  // ID do usuário
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Nome da tabela no banco de dados
  tableName: "UsersQueues";
}

export default UsersQueues;
