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
import Tenant from "./Tenant";

// Modelo para configurações do sistema
// Gerencia configurações em formato chave-valor por tenant
@Table
class Setting extends Model<Setting> {
  // ID único da configuração
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Chave da configuração
  // Ex: "chatbot_active", "business_hours", etc
  @Column
  key: string;

  // Valor da configuração
  // Pode conter strings, números, JSON stringificado, etc
  @Column
  value: string;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  // Cada tenant tem suas próprias configurações
  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default Setting;
