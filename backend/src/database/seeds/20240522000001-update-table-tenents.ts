import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Update the maxConnections and maxUsers columns for the row with id 1 in the Tenants table
    await queryInterface.sequelize.query(`
      UPDATE "Tenants"
      SET "maxConnections" = 99, "maxUsers" = 99
      WHERE "id" = 1;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Revert the changes made in the up migration
    // (You can implement the down migration logic here if needed)
  }
};
