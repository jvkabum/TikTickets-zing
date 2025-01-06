import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Index
} from "sequelize-typescript";
import Contact from "./Contact";
import Tag from "./Tag";
import Tenant from "./Tenant";

// Modelo para relacionamento entre contatos e tags
// Tabela de junção para relacionamento muitos-para-muitos
@Table
class ContactTag extends Model<ContactTag> {
  // ID único do relacionamento
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // ID do contato
  @Index
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact)
  contact: Contact;

  // ID da tag
  @Index
  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  // Relacionamento com a tag
  @BelongsTo(() => Tag)
  tag: Tag;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;
}

export default ContactTag;
