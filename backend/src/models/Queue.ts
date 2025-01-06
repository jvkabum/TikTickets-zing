import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  Default
} from "sequelize-typescript";
import Tenant from "./Tenant";
import User from "./User";

// Modelo para filas de atendimento
// Gerencia as filas de distribuição de tickets entre atendentes
@Table
class Queue extends Model<Queue> {
  // ID único da fila
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome/identificador da fila
  // Ex: "Suporte", "Vendas", "Financeiro", etc
  @Column
  queue: string;

  // Status de ativação da fila
  @Default(true)
  @Column
  isActive: boolean;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // ID do usuário responsável pela fila
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default Queue;
