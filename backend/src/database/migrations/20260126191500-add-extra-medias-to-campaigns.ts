import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Campaigns", "mediaUrl2", {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            }),
            queryInterface.addColumn("Campaigns", "mediaType2", {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            }),
            queryInterface.addColumn("Campaigns", "mediaUrl3", {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            }),
            queryInterface.addColumn("Campaigns", "mediaType3", {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            })
        ]);
    },

    down: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Campaigns", "mediaUrl2"),
            queryInterface.removeColumn("Campaigns", "mediaType2"),
            queryInterface.removeColumn("Campaigns", "mediaUrl3"),
            queryInterface.removeColumn("Campaigns", "mediaType3")
        ]);
    }
};
