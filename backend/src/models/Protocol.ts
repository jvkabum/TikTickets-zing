import {
  Table,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript"

import Contact from "./Contact"
import Tenant from "./Tenant"
import Ticket from "./Ticket"
import User from "./User"

@Table({
  timestamps: true,
  updatedAt: false
})
class Protocol extends Model<Protocol> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: "Número do protocolo que vincula abertura/fechamento"
  })
  protocolNumber: string

  @ForeignKey(() => Contact)
  @Column
  contactId: number

  @BelongsTo(() => Contact)
  contact: Contact

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number

  @BelongsTo(() => Tenant)
  tenant: Tenant

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number

  @BelongsTo(() => Ticket)
  ticket: Ticket

  @ForeignKey(() => User)
  @Column
  userId: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: "Nome do usuário que criou ou fechou o protocolo"
  })
  userName: string

  @BelongsTo(() => User)
  user: User

  @Column({
    type: DataType.ENUM("ABER", "FECH"),
    allowNull: false,
    defaultValue: "ABER",
    comment: "Status do protocolo (ABER=Abertura, FECH=Fechamento)"
  })
  status: "ABER" | "FECH"

  @CreatedAt
  createdAt: Date
}

export default Protocol;
