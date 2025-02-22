import { QueryInterface, Sequelize } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.addColumn("Messages", "protocolNumber", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    return queryInterface.removeColumn("Messages", "protocolNumber");
  },
};
