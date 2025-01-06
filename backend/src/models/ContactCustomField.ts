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

// Modelo para campos personalizados de contatos
// Permite adicionar campos dinâmicos aos contatos
@Table
class ContactCustomField extends Model<ContactCustomField> {
  // ID único do campo personalizado
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome do campo personalizado
  // Ex: "Aniversário", "Empresa", "Cargo", etc
  @Column
  name: string;

  // Valor do campo personalizado
  // Ex: "25/12", "Microsoft", "Gerente", etc
  @Column
  value: string;

  // ID do contato associado
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact)
  contact: Contact;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;
}

export default ContactCustomField;
