import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";

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
	    const { ticket } = message;
	    socketEmit({
        tenantId: ticket.tenantId,
        type: "chat:update",
        payload: message
      });
//socket nao funciona descobrir motivo
    }
  } catch (err) {
    console.error(`Error Message Revoke. Err: ${err}`);
  }
};


export default verifyRevoked;
