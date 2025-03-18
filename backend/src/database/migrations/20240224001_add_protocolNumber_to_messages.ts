import { QueryInterface, DataTypes } from "sequelize"

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Messages", "protocolNumber", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Messages", "protocolNumber");
  }
} 