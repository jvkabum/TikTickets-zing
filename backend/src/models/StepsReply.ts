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
  AutoIncrement,
  HasMany,
  Default
} from "sequelize-typescript";
import User from "./User";
import AutoReply from "./AutoReply";
import StepsReplyAction from "./StepsReplyAction";

// Modelo para passos de respostas automáticas
// Gerencia os passos individuais de um fluxo de resposta automática
@Table({ freezeTableName: true })
class StepsReply extends Model<StepsReply> {
  // ID único do passo
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  // Mensagem de resposta deste passo
  @Column(DataType.TEXT)
  reply: string;

  // Indica se é o passo inicial do fluxo
  @Default(false)
  @Column(DataType.BOOLEAN)
  initialStep: boolean;

  // ID da resposta automática associada
  @Column
  @ForeignKey(() => AutoReply)
  idAutoReply: number;

  // Relacionamento com a resposta automática
  @BelongsTo(() => AutoReply, "idAutoReply")
  autoReply: AutoReply;

  // ID do usuário que criou o passo
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // Data de criação do registro
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // Relacionamento com as ações do passo
  // Um passo pode ter várias ações associadas
  @HasMany(() => StepsReplyAction)
  stepsReplyAction: StepsReplyAction;

  // Nome da tabela no banco de dados
  tableName: "StepsReply";
}

export default StepsReply;
