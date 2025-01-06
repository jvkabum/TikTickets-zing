import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  HasMany,
  BeforeCreate,
  ForeignKey,
  BelongsTo,
  BelongsToMany
} from "sequelize-typescript";
import Campaign from "./Campaign";
import CampaignContacts from "./CampaignContacts";
import ContactCustomField from "./ContactCustomField";
import ContactWallet from "./ContactWallet";
import Tags from "./Tag";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import ContactTag from "./ContactTag";
import User from "./User";

// Modelo para contatos
// Gerencia informações de contatos em diferentes canais (WhatsApp, Telegram, etc)
@Table
class Contact extends Model<Contact> {
  // ID único do contato
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome do contato
  @Column
  name: string;

  // Número de telefone
  @AllowNull(true)
  @Column
  number: string;

  // Endereço de e-mail
  @AllowNull(true)
  @Default(null)
  @Column
  email: string;

  // URL da foto de perfil
  @Column
  profilePicUrl: string;

  // Nome exibido no WhatsApp
  @AllowNull(true)
  @Default(null)
  @Column
  pushname: string;

  // ID do contato no Telegram
  @AllowNull(true)
  @Default(null)
  @Column
  telegramId: string;

  // ID do contato no Messenger
  @AllowNull(true)
  @Default(null)
  @Column
  messengerId: string;

  // ID do contato no Instagram
  @AllowNull(true)
  @Default(null)
  @Column
  instagramPK: number;

  // Indica se é um usuário do sistema
  @Default(false)
  @Column
  isUser: boolean;

  // Indica se é um contato do WhatsApp
  @Default(false)
  @Column
  isWAContact: boolean;

  // Indica se é um grupo
  @Default(false)
  @Column
  isGroup: boolean;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Relacionamento com tickets
  // Um contato pode ter vários tickets
  @HasMany(() => Ticket)
  tickets: Ticket[];

  // Campos personalizados do contato
  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  // Tags associadas ao contato
  @BelongsToMany(() => Tags, () => ContactTag, "contactId", "tagId")
  tags: Tags[];

  // Carteiras associadas ao contato
  @BelongsToMany(() => User, () => ContactWallet, "contactId", "walletId")
  wallets: ContactWallet[];

  // Relacionamento com carteiras
  @HasMany(() => ContactWallet)
  contactWallets: ContactWallet[];

  // Relacionamento com campanhas
  @HasMany(() => CampaignContacts)
  campaignContacts: CampaignContacts[];

  // Campanhas associadas ao contato
  @BelongsToMany(
    () => Campaign,
    () => CampaignContacts,
    "contactId",
    "campaignId"
  )
  campaign: Campaign[];

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;
}

export default Contact;
