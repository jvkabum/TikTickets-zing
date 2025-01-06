import { Message as WbotMessage } from "whatsapp-web.js";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

// Função para buscar uma mensagem específica do WhatsApp
// @param ticket - Ticket associado à mensagem
// @param messageId - ID da mensagem a ser buscada
// @param totalMessages - Número máximo de mensagens a serem verificadas (padrão: 100)
// @returns Promise<WbotMessage | undefined> - Retorna a mensagem encontrada ou undefined
export const GetWbotMessage = async (
  ticket: Ticket,
  messageId: string,
  totalMessages = 100
): Promise<WbotMessage | undefined> => {
  // Obtém a instância do WhatsApp Web associada ao ticket
  const wbot = await GetTicketWbot(ticket);

  // Obtém o chat pelo ID do contato/grupo
  const wbotChat = await wbot.getChatById(
    `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  );

  // Limite inicial de mensagens a serem buscadas por vez
  let limit = 20;

  // Função recursiva para buscar mensagens gradualmente
  // Aumenta o limite em 20 a cada tentativa até encontrar a mensagem
  const fetchWbotMessagesGradually = async (): Promise<void | WbotMessage> => {
    // Busca as mensagens do chat com o limite atual
    const chatMessages = await wbotChat.fetchMessages({ limit });

    // Procura a mensagem específica pelo ID
    const msgFound = chatMessages.find(msg => msg.id.id === messageId);

    // Se não encontrou e ainda não atingiu o limite total, aumenta o limite e tenta novamente
    if (!msgFound && limit < totalMessages) {
      limit += 20;
      return fetchWbotMessagesGradually();
    }

    return msgFound;
  };

  try {
    // Tenta buscar a mensagem
    const msgFound = await fetchWbotMessagesGradually();

    // Se não encontrou após todas as tentativas, retorna undefined
    if (!msgFound) {
      console.error(
        `Cannot found message within ${totalMessages} last messages`
      );
      return undefined;
    }

    // Retorna a mensagem encontrada
    return msgFound;
  } catch (err) {
    // Registra erro no log e lança exceção
    logger.error(err);
    throw new AppError("ERR_FETCH_WAPP_MSG");
  }
};

export default GetWbotMessage;
