import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Campaigns", "totalMessages", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn("Campaigns", "sentMessages", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn("Campaigns", "failedMessages", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Campaigns", "totalMessages");
    await queryInterface.removeColumn("Campaigns", "sentMessages");
    await queryInterface.removeColumn("Campaigns", "failedMessages");
  }
}; 