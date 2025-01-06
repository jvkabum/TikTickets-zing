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
  AutoIncrement,
  HasMany
} from "sequelize-typescript";
import User from "./User";
import StepsReply from "./StepsReply";
import Tenant from "./Tenant";

// Modelo para respostas automáticas
// Gerencia as configurações de respostas automáticas do sistema
@Table({ freezeTableName: true })
class AutoReply extends Model<AutoReply> {
  // ID único da resposta automática
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  // Nome da resposta automática
  @Column(DataType.TEXT)
  name: string;

  // Número de celular para testes
  // Usado para testar as respostas antes de ativar para todos
  @Default(null)
  @Column(DataType.TEXT)
  celularTeste: string;

  // Status de ativação da resposta automática
  @Default(true)
  @Column
  isActive: boolean;

  // Tipo de ação a ser executada
  // 0: Padrão, outros valores podem indicar ações específicas
  @Default(0)
  @Column
  action: number;

  // ID do usuário que criou/gerencia a resposta
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

  // Relacionamento com os passos da resposta
  // Uma resposta automática pode ter vários passos
  @HasMany(() => StepsReply)
  stepsReply: StepsReply;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Nome da tabela no banco de dados
  tableName: "AutoReply";
}

export default AutoReply;
