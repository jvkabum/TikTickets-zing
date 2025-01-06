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

// Modelo para tags
// Gerencia etiquetas que podem ser associadas a contatos, tickets, etc
@Table
class Tags extends Model<Tags> {
  // ID único da tag
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome/texto da tag
  // Ex: "Cliente VIP", "Problema Técnico", "Urgente"
  @Column
  tag: string;

  // Cor da tag em formato hexadecimal
  // Ex: "#FF0000" para vermelho
  @Column
  color: string;

  // Status de ativação da tag
  @Default(true)
  @Column
  isActive: boolean;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // ID do usuário que criou a tag
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Coluna para tag automática
  @Column
  autoTag: string; // Nova coluna para indicar se a tag é automática

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

export default Tags;
