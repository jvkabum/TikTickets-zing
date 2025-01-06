import {
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AllowNull,
  AfterCreate,
  AfterUpdate
} from "sequelize-typescript";
import { v4 as uuidV4 } from "uuid";
import Queue from "../libs/Queue";
import Tenant from "./Tenant";
import Whatsapp from "./Whatsapp";

// Modelo para mensagens da API
// Gerencia as mensagens enviadas/recebidas através da API externa
class ApiMessage extends Model<ApiMessage> {
  // ID único da mensagem
  @PrimaryKey
  @Default(uuidV4)
  @Column(DataType.UUID)
  id: string;

  // ID da sessão do WhatsApp associada
  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  // Relacionamento com a sessão do WhatsApp
  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  // Status de confirmação da mensagem (ack)
  // 0: Pendente, 1: Enviado, 2: Recebido, 3: Lido, etc
  @Default(0)
  @Column
  ack: number;

  // ID único da mensagem no WhatsApp
  @PrimaryKey
  @Column
  messageId: string;

  // Conteúdo da mensagem
  @Column(DataType.TEXT)
  body: string;

  // Número do destinatário/remetente
  @AllowNull(false)
  @Column
  number: string;

  // Nome do arquivo de mídia (se houver)
  @Column
  mediaName: string;

  // URL do arquivo de mídia
  @Column
  mediaUrl: string;

  // Chave externa para referência em sistemas externos
  @Column
  externalKey: string;

  // Timestamp da mensagem
  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  timestamp: number;

  // Dados completos da mensagem do WhatsApp
  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  messageWA: object;

  // Configurações da API associada
  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  apiConfig: object;

  // Data de criação do registro
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // ID do tenant (empresa/organização)
  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  // Relacionamento com o tenant
  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Nome da tabela no banco de dados
  tableName: "ApiMessages";

  // Hook executado após criar ou atualizar mensagem
  // Envia notificação de status para webhook configurado
  @AfterCreate
  @AfterUpdate
  static HookMessage(instance: any): void {
    // Se existe URL configurada para status de mensagem
    if (instance?.apiConfig?.urlMessageStatus) {
      // Prepara payload com informações da mensagem
      const payload = {
        ack: instance.ack,
        body: instance.body,
        messageId: instance.messageId,
        number: instance.number,
        externalKey: instance.externalKey,
        type: "hookMessageStatus",
        authToken: instance.authToken
      };

      // Adiciona tarefa na fila para enviar webhook
      Queue.add("WebHooksAPI", {
        url: instance.apiConfig.urlMessageStatus,
        type: payload.type,
        payload
      });
    }
  }
}

export default ApiMessage;
