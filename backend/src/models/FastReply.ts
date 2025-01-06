import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  AllowNull,
  DataType
} from "sequelize-typescript";
import Tenant from "./Tenant";
import User from "./User";

// Modelo para respostas rápidas
// Gerencia mensagens predefinidas para respostas rápidas
@Table({ freezeTableName: true })
class FastReply extends Model<FastReply> {
  // ID único da resposta rápida
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Chave/atalho para acionar a resposta rápida
  // Ex: "#ola", "#obrigado", etc
  @AllowNull(false)
  @Column
  key: string;

  // Mensagem completa da resposta rápida
  @AllowNull(false)
  @Column
  message: string;

  // ID do usuário que criou a resposta
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

  // Array de mídias associadas à resposta rápida
  // Pode incluir imagens, vídeos, documentos, etc
  @AllowNull(true)
  @Column({
    type: DataType.JSON,
    validate: {
      // Validação para garantir que o valor é um array de strings
      isArrayOfStrings(value: string[]) {
        if (!Array.isArray(value)) {
          throw new Error('Medias must be an array.');
        }
        value.forEach((item) => {
          if (typeof item !== 'string') {
            throw new Error('Each media must be a string.');
          }
        });
      }
    }
  })
  medias: string[];

  // Data de criação do registro
  @CreatedAt
  createdAt: Date;

  // Data da última atualização
  @UpdatedAt
  updatedAt: Date;

  // Nome da tabela no banco de dados
  tableName: "FastReply";
}

export default FastReply;
