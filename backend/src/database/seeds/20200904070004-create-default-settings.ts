import { QueryInterface } from "sequelize";

module.exports = {
  // ====================
  // Função de Migração para Criar Configurações Padrão
  // ====================
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('userCreation', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 1); // Configuração para desabilitar a criação de usuários
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('NotViewTicketsQueueUndefined', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 2); // Configuração para não visualizar tickets em filas indefinidas
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('NotViewTicketsChatBot', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 3); // Configuração para não visualizar tickets do chatbot
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('DirectTicketsToWallets', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 4); // Configuração para desabilitar o direcionamento de tickets para carteiras
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('NotViewAssignedTickets', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 6); // Configuração para não visualizar tickets atribuídos
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('botTicketActive', '3', '2020-12-12 16:08:45.354', '2022-07-01 21:10:02.076', 1, 5); // Configuração para definir o bot de tickets ativo
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('ignoreGroupMsg', 'enabled', '2022-12-16 16:08:45.354' , '2022-12-16 21:10:02.076', 1, 7); // Configuração para ignorar mensagens de grupo
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('rejectCalls', 'disabled', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 9); // Configuração para desabilitar chamadas
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId", id) VALUES('callRejectMessage', 'As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.', '2020-12-12 16:08:45.354', '2020-12-12 16:08:45.354', 1, 10); // Mensagem de rejeição de chamadas
      `
    ); // Insere configurações padrão na tabela Settings
  },

  // ====================
  // Função de Reversão da Migração
  // ====================
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {}); // Remove todas as configurações da tabela Settings
  }
};
