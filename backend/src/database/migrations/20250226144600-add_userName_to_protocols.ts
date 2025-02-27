    import { QueryInterface, DataTypes } from "sequelize"

    module.exports = {
    up: (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
        return queryInterface.addColumn("Protocols", "userName", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Nome do usuário que criou/fechou o protocolo"
        })
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeColumn("Protocols", "userName")
    }
    }
    