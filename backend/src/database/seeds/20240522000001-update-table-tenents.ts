import { QueryInterface } from "sequelize";

module.exports = {
  // ====================
  // Função de Migração para Atualizar a Tabela de Inquilinos
  // ====================
  up: async (queryInterface: QueryInterface) => {
    // Atualiza as colunas maxConnections e maxUsers para o registro com id 1 na tabela Tenants
    await queryInterface.sequelize.query(`
      UPDATE "Tenants"
      SET "maxConnections" = 99, "maxUsers" = 99
      WHERE "id" = 1;
    `);
  },

  // ====================
  // Função de Reversão da Migração
  // ====================
  down: async (queryInterface: QueryInterface) => {
    // Reverte as alterações feitas na migração up
    // (Você pode implementar a lógica de reversão aqui, se necessário)
  }
};
