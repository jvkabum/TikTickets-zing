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
  Default
} from "sequelize-typescript";
import User from "./User";
import StepsReply from "./StepsReply";
import Queue from "./Queue";

// Modelo para ações de passos de resposta
// Gerencia as ações que podem ser tomadas em cada passo do fluxo
@Table({ freezeTableName: true })
class StepsReplyActions extends Model<StepsReplyActions> {
  // ID único da ação
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  // ID do passo associado
  @Column
  @ForeignKey(() => StepsReply)
  stepReplyId: number;

  // Relacionamento com o passo
  @BelongsTo(() => StepsReply, "stepReplyId")
  stepsReply: StepsReply;

  // Palavras-chave que ativam esta ação
  @Column(DataType.STRING)
  words: string;

  // Definição da resposta para esta ação
  @Default(null)
  @Column(DataType.TEXT)
  replyDefinition: string;

  // Tipo de ação a ser executada
  // Ex: 0: Resposta simples, 1: Transferir, 2: Finalizar, etc
  @Column
  action: number;

  // ID do usuário que criou a ação
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário criador
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

  // ID da fila para transferência (se aplicável)
  @ForeignKey(() => Queue)
  @Column(DataType.INTEGER)
  queueId: number;

  // Relacionamento com a fila
  @BelongsTo(() => Queue)
  queue: Queue;

  // ID do usuário de destino (se aplicável)
  @ForeignKey(() => User)
  @Column
  userIdDestination: number;

  // Relacionamento com o usuário de destino
  @BelongsTo(() => User)
  userDestination: User;

  // ID do próximo passo no fluxo
  @Column
  @ForeignKey(() => StepsReply)
  nextStepId: number;

  // Relacionamento com o próximo passo
  @BelongsTo(() => StepsReply, "nextStepId")
  nextStep: StepsReply;

  // Nome da tabela no banco de dados
  tableName: "StepsReplyActions";
}

export default StepsReplyActions;
