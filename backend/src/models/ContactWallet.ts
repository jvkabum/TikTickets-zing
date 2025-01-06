import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Contact from "./Contact";
import Tenant from "./Tenant";
import User from "./User";

// Modelo que gerencia as carteiras de contatos no sistema
// Responsável por manter o relacionamento entre contatos, usuários e organizações
@Table
class ContactWallet extends Model<ContactWallet> {
  // ID único do registro na tabela
  // Gerado automaticamente e usado como chave primária
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Referência ao contato associado à carteira
  // Identifica qual contato está sendo gerenciado neste registro
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com a tabela de contatos
  // Permite acessar todas as informações do contato quando necessário
  @BelongsTo(() => Contact)
  contact: Contact;

  // Referência ao usuário que possui a carteira
  // Identifica qual usuário é responsável por este contato
  @ForeignKey(() => User)
  @Column
  walletId: number;

  // Relacionamento com a tabela de usuários
  // Permite acessar os dados do usuário que gerencia este contato
  @BelongsTo(() => User)
  wallet: User;

  // Referência à organização (tenant) do sistema
  // Identifica a qual empresa este registro pertence
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com a tabela de tenants
  // Permite acessar os dados da organização quando necessário
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Timestamp de criação do registro
  // Preenchido automaticamente quando um novo registro é criado
  @CreatedAt
  createdAt: Date;

  // Timestamp da última modificação
  // Atualizado automaticamente quando o registro é alterado
  @UpdatedAt
  updatedAt: Date;
}

/**
 * ContactWallet model manages the relationship between contacts and users (wallets).
 * It includes information about the contact, the user who owns the wallet,
 * and the tenant associated with the wallet. This model is used to track
 * which contacts belong to which users and their respective organizations.
 */
export default ContactWallet;
