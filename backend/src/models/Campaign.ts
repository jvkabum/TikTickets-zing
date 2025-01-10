import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Default,
  AfterFind
} from "sequelize-typescript";
import CampaignContacts from "./CampaignContacts";
import Tenant from "./Tenant";
import User from "./User";
import Whatsapp from "./Whatsapp";

// Modelo para campanhas de mensagens
// Gerencia campanhas de envio em massa de mensagens
@Table({
  tableName: "Campaigns"
})
class Campaign extends Model<Campaign> {
  // ID único da campanha
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome da campanha
  @Column
  name: string;

  // Data de início da campanha
  @Column
  start: Date;

  // Data de término da campanha
  @Column
  end: Date;

  // Status da campanha
  // pending: Pendente
  // scheduled: Agendada
  // processing: Em processamento
  // canceled: Cancelada
  // finished: Finalizada
  @Default("pending")
  @Column(
    DataType.ENUM("pending", "scheduled", "processing", "canceled", "finished")
  )
  status: string;

  // Mensagens da campanha (até 3 mensagens diferentes)
  @Column
  message1: string;

  @Column
  message2: string;

  @Column
  message3: string;

  // URL da mídia (imagem, vídeo, etc)
  // Retorna a URL completa com o endereço do backend
  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const value = this.getDataValue("mediaUrl");
    if (value && value !== "null") {
      const { BACKEND_URL } = process.env;
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  // Tipo de mídia (imagem, vídeo, áudio, etc)
  @Column
  mediaType: string;

  // ID do usuário que criou a campanha
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

  // ID da sessão do WhatsApp
  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  // Relacionamento com a sessão
  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Relacionamento com os contatos da campanha
  @HasMany(() => CampaignContacts)
  campaignContacts: CampaignContacts[];

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Atraso entre envios (em milissegundos)
  @Column
  delay: number;

  // Hook executado após buscar registros
  // Atualiza o status da campanha baseado no progresso
  @AfterFind
  static async updatedInstances(instances: any): Promise<void | any> {
    if (!Array.isArray(instances)) return instances;
    const newInstances = await Promise.all(
      instances.map(async (instance: any) => {
        // Só processa campanhas que não estão em estados finais
        if (!["pending", "finished", "canceled"].includes(instance.status)) {
          // Contadores de status das mensagens
          const pendentesEntrega = +instance.dataValues.pendentesEntrega;
          const pendentesEnvio = +instance.dataValues.pendentesEnvio;
          const recebidas = +instance.dataValues.recebidas;
          const lidas = +instance.dataValues.lidas;
          const contactsCount = +instance.dataValues.contactsCount;

          // Total de mensagens processadas
          const totalTransacionado =
            pendentesEntrega + pendentesEnvio + recebidas + lidas;

          // Se está agendada e todos contatos estão pendentes
          if (
            instance.status === "scheduled" &&
            contactsCount === pendentesEnvio
          ) {
            return instance;
          }

          // Se o total processado é diferente do total de contatos
          // significa que ainda está em processamento
          if (contactsCount !== totalTransacionado) {
            instance.status = "processing";
            await instance.update({ status: "processing" });
          }

          // Se o total processado é igual ao total de contatos
          // significa que finalizou
          if (contactsCount === totalTransacionado) {
            instance.status = "finished";
            await instance.update({ status: "finished" });
          }

          return instance;
        }
        // ("pending", "scheduled", "processing", "canceled", "finished")
      })
    );
    return newInstances;
  }

  // Total de mensagens da campanha
  @Column(DataType.INTEGER)
  totalMessages: number;

  // Mensagens enviadas com sucesso
  @Column(DataType.INTEGER)
  sentMessages: number;

  // Mensagens com falha
  @Column(DataType.INTEGER)
  failedMessages: number;
}

export default Campaign;
