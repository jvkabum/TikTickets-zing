/* eslint-disable no-restricted-syntax */
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AutoIncrement,
  AllowNull
} from "sequelize-typescript";
import User from "./User";
import Tenant from "./Tenant";

// Modelo para fluxos de chat
// Gerencia os fluxos de conversação automatizados (chatbots)
@Table({ freezeTableName: true })
class ChatFlow extends Model<ChatFlow> {
  // ID único do fluxo
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  // Nome do fluxo
  @Column(DataType.TEXT)
  name: string;

  // Configuração do fluxo em formato JSON
  // Contém todos os nós, interações e caminhos do fluxo
  @Default({})
  @AllowNull
  @Column(DataType.JSON)
  get flow(): any {
    const flow = this.getDataValue("flow");
    if (flow) {
      // Processa cada nó do fluxo
      for (const node of flow.nodeList) {
        if (node.type === "node") {
          // Para cada interação do nó
          for (const item of node.interactions) {
            // Se for um campo de mídia com URL
            if (item.type === "MediaField" && item.data.mediaUrl) {
              const { BACKEND_URL, PROXY_PORT } = process.env;
              const file = item.data.mediaUrl;
              // Armazena nome original do arquivo
              item.data.fileName = file;
              // Atualiza URL com caminho completo do backend
              item.data.mediaUrl = `${BACKEND_URL}:${PROXY_PORT}/public/${file}`;
            }
          }
        }
      }
      return flow;
    }
    return {};
  }

  // Status de ativação do fluxo
  @Default(true)
  @Column
  isActive: boolean;

  // Indica se o fluxo foi deletado (soft delete)
  @Default(false)
  @Column
  isDeleted: boolean;

  // Número de celular para testes
  @Default(null)
  @Column(DataType.TEXT)
  celularTeste: string;

  // ID do usuário que criou o fluxo
  @ForeignKey(() => User)
  @Column
  userId: number;

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

  // Data de criação do registro
  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  // Nome da tabela no banco de dados
  tableName: "ChatFlow";
}

export default ChatFlow;
