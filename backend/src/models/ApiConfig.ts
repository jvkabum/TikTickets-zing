import {
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import { v4 as uuidV4 } from "uuid";
import User from "./User";
import Tenant from "./Tenant";
import Whatsapp from "./Whatsapp";

// Modelo para configurações de API
// Gerencia as configurações de integração com APIs externas
class ApiConfig extends Model<ApiConfig> {
  // ID único da configuração
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

  // Nome da configuração da API
  @Column
  name: string;

  // Status de ativação da configuração
  @Default(true)
  @Column
  isActive: boolean;

  // Token de acesso à API
  @Column
  token: string;

  // Token de autenticação adicional
  @Column
  authToken: string;

  // URL para verificar status do serviço
  @Column
  urlServiceStatus: string;

  // URL para verificar status das mensagens
  @Column
  urlMessageStatus: string;

  // ID do usuário que criou/gerencia a configuração
  @ForeignKey(() => User)
  @Column
  userId: number;

  // Relacionamento com o usuário
  @BelongsTo(() => User)
  user: User;

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
  tableName: "ApiConfigs";
}

export default ApiConfig;
