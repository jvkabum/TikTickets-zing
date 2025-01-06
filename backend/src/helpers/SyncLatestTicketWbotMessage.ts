// import { Message as WbotMessage } from "whatsapp-web.js";
// import { Op } from "sequelize";
// import Ticket from "../models/Ticket";
// import GetTicketWbot from "./GetTicketWbot";
// import AppError from "../errors/AppError";
// import { logger } from "../utils/logger";
// import Message from "../models/Message";

// Função para sincronizar as últimas mensagens de um ticket com o WhatsApp
// Atualmente está comentada, possivelmente em desenvolvimento ou revisão
// @param ticket - Ticket cujas mensagens precisam ser sincronizadas
// @returns Promise<WbotMessage> - Retornaria a última mensagem sincronizada
// export const SyncLatestTicketWbotMessage = async (
//   ticket: Ticket
// ): Promise<WbotMessage> => {
//   // Obtém a instância do WhatsApp Web para o ticket
//   const wbot = await GetTicketWbot(ticket);

//   // Obtém o chat pelo ID do contato/grupo
//   const wbotChat = await wbot.getChatById(
//     `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
//   );

//   // Define limite de mensagens a serem buscadas
//   const limit = 20;

//   try {
//     // Busca as mensagens do chat
//     const chatMessages = await wbotChat.fetchMessages({ limit });

//     if (chatMessages) {
//       // Filtra mensagens pela data de criação do ticket
//       const ticketDateMessages = chatMessages.filter(
//         msg => msg.timestamp >= ticket.createdAt.getTime()
//       );

//       // Loop para processar mensagens (implementação pendente)
//       for (const msg of ticketDateMessages) {
//       }
//       // Código comentado para buscar mensagens não sincronizadas
//       // const idsMgs = ticketMessages.map(m => String(m.id));
//       // const messages = await Message.findAll({
//       //   where: {
//       //     contactId: ticket.contactId,
//       //     messageId: {
//       //       [Op.notIn]: idsMgs
//       //     }
//       //   },
//       //   limit: 20,
//       //   order: [["createdAt", "DESC"]]
//       // });
//       // const idsMessages = messages.map(m => m.messageId);
//     }
//   } catch (err) {
//     // Registra erro no log e lança exceção
//     logger.error(err);
//     throw new AppError("ERR_FETCH_WAPP_MSG");
//   }
// };

// export default SyncLatestTicketWbotMessage;
