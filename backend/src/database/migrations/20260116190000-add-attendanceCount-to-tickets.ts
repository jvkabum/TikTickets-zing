import { DataTypes, QueryInterface } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.addColumn("Tickets", "attendanceCount", {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn("Tickets", "attendanceCount");
    }
};
