import { sign } from "jsonwebtoken";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  ForeignKey,
  BelongsTo,
  AfterUpdate,
  BeforeCreate,
  BeforeUpdate
} from "sequelize-typescript";
import webHooks from "../config/webHooks.dev.json";
import authConfig from "../config/auth";
import Queue from "../libs/Queue";
import ApiConfig from "./ApiConfig";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import ChatFlow from "./ChatFlow";

// Modelo para conexões WhatsApp e outros canais
// Gerencia as conexões com diferentes plataformas de mensagem
@Table
class Whatsapp extends Model<Whatsapp> {
  // ID único da conexão
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nome da conexão
  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  // Dados da sessão
  @Column(DataType.TEXT)
  session: string;

  // QR Code para conexão WhatsApp
  @Column(DataType.TEXT)
  qrcode: string;

  // Status da conexão
  @Column
  status: string;

  // Nível da bateria do dispositivo
  @Column
  battery: string;

  // Indica se está carregando
  @Column
  plugged: boolean;

  // Status de ativação
  @Default(true)
  @Column
  isActive: boolean;

  // Indica se foi deletado (soft delete)
  @Default(false)
  @Column
  isDeleted: boolean;

  // Número de tentativas de conexão
  @Column
  retries: number;

  // Indica se é a conexão padrão
  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;

  // Token do Telegram
  @Default(null)
  @AllowNull
  @Column
  tokenTelegram: string;

  // Usuário do Instagram
  @Default(null)
  @AllowNull
  @Column
  instagramUser: string;

  // Chave do Instagram
  @Default(null)
  @AllowNull
  @Column
  instagramKey: string;

  // ID da página do Facebook
  @Default(null)
  @AllowNull
  @Column
  fbPageId: string;

  // Dados do Facebook
  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  fbObject: object;

  // Tipo de canal
  @Default("whatsapp")
  @Column(DataType.ENUM("whatsapp", "telegram", "instagram", "messenger"))
  type: string;

  // Data de criação
  @CreatedAt
  createdAt: Date;

  // Data de atualização
  @UpdatedAt
  updatedAt: Date;

  // Número do WhatsApp
  @Column
  number: string;

  // Dados do telefone
  @Column(DataType.JSONB)
  phone: object;

  // Tickets associados
  @HasMany(() => Ticket)
  tickets: Ticket[];

  // ID do tenant
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // ID do fluxo de chat
  @ForeignKey(() => ChatFlow)
  @Column
  chatFlowId: number;

  // Relacionamento com fluxo
  @BelongsTo(() => ChatFlow)
  chatFlow: ChatFlow;

  // Provedor WhatsApp Business API
  @Default(null)
  @AllowNull
  @Column(DataType.ENUM("360", "gupshup"))
  wabaBSP: string;

  // Token da API
  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  tokenAPI: string;

  // Token para webhooks
  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  tokenHook: string;

  // Mensagem de despedida
  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  farewellMessage: string;

  // URL do webhook WhatsApp Business
  @Column(DataType.VIRTUAL)
  get UrlWabaWebHook(): string | null {
    const key = this.getDataValue("tokenHook");
    const wabaBSP = this.getDataValue("wabaBSP");
    let BACKEND_URL;
    BACKEND_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "dev") {
      BACKEND_URL = webHooks.urlWabahooks;
    }
    return `${BACKEND_URL}/wabahooks/${wabaBSP}/${key}`;
  }

  // URL do webhook Messenger
  @Column(DataType.VIRTUAL)
  get UrlMessengerWebHook(): string | null {
    const key = this.getDataValue("tokenHook");
    let BACKEND_URL;
    BACKEND_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "dev") {
      BACKEND_URL = webHooks.urlWabahooks;
    }
    return `${BACKEND_URL}/fb-messenger-hooks/${key}`;
  }

  // Hook executado após atualização
  // Notifica APIs externas sobre mudanças de status
  @AfterUpdate
  static async HookStatus(instance: Whatsapp & any): Promise<void> {
    const { status, name, qrcode, number, tenantId, id: sessionId } = instance;
    const payload: any = {
      name,
      number,
      status,
      qrcode,
      timestamp: Date.now(),
      type: "hookSessionStatus"
    };

    const apiConfig: any = await ApiConfig.findAll({
      where: { tenantId, sessionId }
    });

    if (!apiConfig) return;

    await Promise.all(
      apiConfig.map((api: ApiConfig) => {
        if (api.urlServiceStatus) {
          if (api.authToken) {
            payload.authToken = api.authToken;
          }
          return Queue.add("WebHooksAPI", {
            url: api.urlServiceStatus,
            type: payload.type,
            payload
          });
        }
      })
    );
  }

  // Hook executado antes de criar/atualizar
  // Gera token para webhooks
  @BeforeUpdate
  @BeforeCreate
  static async CreateTokenWebHook(instance: Whatsapp): Promise<void> {
    const { secret } = authConfig;

    if (
      !instance?.tokenHook &&
      (instance.type === "waba" || instance.type === "messenger")
    ) {
      const tokenHook = sign(
        {
          tenantId: instance.tenantId,
          whatsappId: instance.id
        },
        secret,
        {
          expiresIn: "10000d"
        }
      );

      instance.tokenHook = tokenHook;
    }
  }
}

export default Whatsapp;
