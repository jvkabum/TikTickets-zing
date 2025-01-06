import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Default,
  DataType,
  AllowNull
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Contact from "./Contact";
import Message from "./Message";

// Modelo para contatos de campanha
// Gerencia a relação entre campanhas e contatos, incluindo status de envio
@Table
class CampaignContacts extends Model<CampaignContacts> {
  // ID único do registro
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Status de confirmação da mensagem
  // 0: Pendente, 1: Enviado, 2: Recebido, 3: Lido, etc
  @Default(0)
  @Column
  ack: number;

  // Conteúdo da mensagem
  @Column(DataType.TEXT)
  body: string;

  // Mensagem aleatória selecionada (caso a campanha tenha múltiplas opções)
  @Column
  messageRandom: string;

  // Nome do arquivo de mídia (se houver)
  @AllowNull
  @Default(null)
  @Column
  mediaName: string;

  // Timestamp do envio
  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  timestamp: number;

  // ID da mensagem enviada
  @ForeignKey(() => Message)
  @Column
  messageId: string;

  // Relacionamento com a mensagem
  @BelongsTo(() => Message, "messageId")
  message: Message;

  // ID da campanha
  @ForeignKey(() => Campaign)
  @Column
  campaignId: string;

  // Relacionamento com a campanha
  @BelongsTo(() => Campaign, "campaignId")
  campaign: Campaign;

  // ID do contato
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  // Relacionamento com o contato
  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;
}

export default CampaignContacts;
