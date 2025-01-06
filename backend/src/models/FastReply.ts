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
  AllowNull
} from "sequelize-typescript";
import Tenant from "./Tenant";
import User from "./User";

@Table({ freezeTableName: true })
class FastReply extends Model<FastReply> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  key: string;

  @AllowNull(false)
  @Column
  message: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  // Adicionando a coluna 'medias'
  @AllowNull(true)
  @Column({
    type: DataType.JSON,
    validate: {
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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  tableName: "FastReply";
}

export default FastReply;
