import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import { getActiveWbot } from "../../libs/wbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";
import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  userId?: number | string | undefined;
}

export const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  userId
}: Request): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;
  if (quotedMsg) {
    await GetWbotMessage(ticket, quotedMsg.id);
    quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
  }

  // Tenta usar a nova função que verifica conexão real
  try {
    const wbot = await getActiveWbot(ticket.whatsappId);
    
    try {
      const sendMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
        body,
        {
          quotedMessageId: quotedMsgSerializedId,
          linkPreview: false // fix: send a message takes 2 seconds when there's a link on message body
        }
      );
  
      await ticket.update({
        lastMessage: body,
        lastMessageAt: new Date().getTime()
      });
      
      try {
        if (userId) {
          await UserMessagesLog.create({
            messageId: sendMessage.id.id,
            userId,
            ticketId: ticket.id
          });
        }
      } catch (error) {
        logger.error(`Error criar log mensagem ${error}`);
      }
      
      return sendMessage;
    } catch (sendError) {
      logger.error(`Erro ao enviar mensagem: ${sendError}`);
      throw sendError;
    }
  } catch (connectionError) {
    logger.error(`Erro de conexão ao enviar mensagem: ${connectionError}`);
    
    // Tenta o método tradicional como fallback
    try {
      const wbot = await GetTicketWbot(ticket);
      
      const sendMessage = await wbot.sendMessage(
        `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
        body,
        {
          quotedMessageId: quotedMsgSerializedId,
          linkPreview: false
        }
      );
      
      await ticket.update({
        lastMessage: body,
        lastMessageAt: new Date().getTime()
      });
      
      try {
        if (userId) {
          await UserMessagesLog.create({
            messageId: sendMessage.id.id,
            userId,
            ticketId: ticket.id
          });
        }
      } catch (error) {
        logger.error(`Error criar log mensagem ${error}`);
      }
      
      return sendMessage;
    } catch (fallbackError) {
      // Se falhar aqui, tenta explicitamente reconectar a sessão
      logger.error(`Falha no fallback ao enviar mensagem: ${fallbackError}`);
      
      // Tenta reconectar a sessão
      try {
        await StartWhatsAppSessionVerify(ticket.whatsappId, fallbackError.toString());
        
        // Espera um tempo para a reconexão
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Última tentativa após reconexão explícita
        const wbotReconnected = await GetTicketWbot(ticket);
        const sendMessage = await wbotReconnected.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          body,
          {
            quotedMessageId: quotedMsgSerializedId,
            linkPreview: false
          }
        );
        
        await ticket.update({
          lastMessage: body,
          lastMessageAt: new Date().getTime()
        });
        
        try {
          if (userId) {
            await UserMessagesLog.create({
              messageId: sendMessage.id.id,
              userId,
              ticketId: ticket.id
            });
          }
        } catch (error) {
          logger.error(`Error criar log mensagem ${error}`);
        }
        
        return sendMessage;
      } catch (finalError) {
        logger.error(`Todas as tentativas de envio falharam: ${finalError}`);
        throw new AppError("ERR_SENDING_WAPP_MSG_DISCONNECTED", 403);
      }
    }
  }
};

export default SendWhatsAppMessage;
