import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tags", "autoTag", {
      type: DataTypes.STRING,
      allowNull: true, // Permitir valores nulos inicialmente
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tags", "autoTag");
  }
};
