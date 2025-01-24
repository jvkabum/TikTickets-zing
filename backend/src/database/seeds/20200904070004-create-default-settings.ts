import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id)
      VALUES
        ('userCreation', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 1),
        ('NotViewTicketsQueueUndefined', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 2),
        ('NotViewTicketsChatBot', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 3),
        ('DirectTicketsToWallets', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 4),
        ('NotViewAssignedTickets', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 6),
        ('botTicketActive', '3', '2020-12-12 16:08:45.354', '2022-07-01 21:10:02.076', 1, 5),
        ('ignoreGroupMsg', 'enabled', '2022-12-16 16:08:45.354', '2022-12-16 21:10:02.076', 1, 7),
        ('rejectCalls', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 9),
        ('callRejectMessage', 'As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 10);
        ('manterHistorico', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 11),
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Settings", {
      key: [
        'userCreation',
        'NotViewTicketsQueueUndefined',
        'NotViewTicketsChatBot',
        'DirectTicketsToWallets',
        'NotViewAssignedTickets',
        'botTicketActive',
        'ignoreGroupMsg',
        'rejectCalls',
        'manterHistorico',
        'callRejectMessage'
      ]
    });
  }
};
