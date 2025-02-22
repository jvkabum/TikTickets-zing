import { QueryInterface, DataTypes } from "sequelize"

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Protocols", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      protocolNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Número do protocolo que vincula abertura/fechamento"
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      tenantId: {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      status: {
        type: DataTypes.ENUM,
        values: ["ABER", "FECH"],
        defaultValue: "ABER",
        allowNull: false,
        comment: "Status do protocolo (ABER=Abertura, FECH=Fechamento)"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Data/hora em que o protocolo foi criado"
      }
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Protocols")
  }
} 