import { QueryInterface, DataTypes } from "sequelize"

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addColumn('Protocols', 'userName', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Nome do usuário que criou/fechou o protocolo"
    })
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Protocols', 'userName')
  }
}
