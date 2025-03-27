import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "attendanceCount", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Contador de atendimentos para geração do número do protocolo"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "attendanceCount");
  }
};
