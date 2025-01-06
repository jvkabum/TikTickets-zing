module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("FastReplies", "medias", {
      type: Sequelize.JSON, // Ou outro tipo adequado
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("FastReplies", "medias");
  },
};