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
  DataType
} from "sequelize-typescript";
import User from "./User";

// Modelo para tenants (empresas/organizações)
// Gerencia as diferentes organizações que utilizam o sistema
@Table
class Tenant extends Model<Tenant> {
  // ID único do tenant
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Status do tenant
  // Por padrão é "active" (ativo)
  @Column({ defaultValue: "active" })
  status: string;

  // Nome do tenant
  @Column
  name: string;

  // ID do usuário proprietário
  @ForeignKey(() => User)
  @Column
  ownerId: number;

  // Relacionamento com o usuário proprietário
  @BelongsTo(() => User)
  owner: User;

  // Horário de funcionamento
  // Array com configurações de dias e horários
  @Column(DataType.JSONB)
  businessHours: [];

  // Mensagem exibida fora do horário de funcionamento
  @Column
  messageBusinessHours: string;
  
  // Número máximo de usuários permitidos
  @Column
  maxUsers: number;

  // Número máximo de conexões permitidas
  // (WhatsApp, Telegram, etc)
  @Column
  maxConnections: number;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;
}

export default Tenant;
