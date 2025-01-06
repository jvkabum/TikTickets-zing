import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Tenants", "maxConnections", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.changeColumn("Tenants", "maxUsers", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Tenants", "maxConnections", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.changeColumn("Tenants", "maxUsers", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
    ]);
  },
};
