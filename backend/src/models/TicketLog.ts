import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';
import Ticket from './Ticket';

class TicketLog extends Model {
  declare id: string;
  declare ticketId: string;
  declare message: string;
  declare createdAt: Date;
}

TicketLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TicketLog',
    tableName: 'ticket_logs',
  }
);

// Definir relacionamento com Ticket
TicketLog.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
});

export default TicketLog;