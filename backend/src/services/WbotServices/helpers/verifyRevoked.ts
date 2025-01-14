import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";
import { logger } from "../../../utils/logger";

const verifyRevoked = async (msgBody?: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 500));

  if (msgBody === undefined) {
    return;
  }

  try {
    const message = await Message.findOne({
      where: {
        body: msgBody
      },
	  include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId", "apiConfig"]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (!message) {
      return;
    }

    if (message) {
      // console.log(message);
      await Message.update(
        { isDeleted: true },
        {
          where: { id: message.id }
        }
      );

      const msgIsDeleted = await Message.findOne({
        where: {
          body: msgBody
        }
      });

      if (!msgIsDeleted) {
        return;
      }
	     // Busca a mensagem atualizada com todas as relações
       const updatedMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: Ticket,
            as: "ticket",
            attributes: ["id", "tenantId", "status"],
            required: true
          },
          {
            model: Message,
            as: "quotedMsg",
            include: ["contact"]
          }
        ]
      });
  
      if (!updatedMessage?.ticket) {
        logger.error(`Ticket não encontrado para mensagem: ${message.id}`);
        return;
      }
      socketEmit({
        tenantId: updatedMessage.ticket.tenantId,
        type: "chat:update",
        payload: {
          ...updatedMessage.toJSON(),
          isRevoked: true
        }
      });
//socket nao funciona descobrir motivo
    }
  } catch (err) {
    console.error(`Error Message Revoke. Err: ${err}`);
  }
};


export default verifyRevoked;
