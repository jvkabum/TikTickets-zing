import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";

const handleMsgEdit = async (
  msg: WbotMessage,
  newBody: string
): Promise<void> => {
  
  try {
    // Buscar a mensagem no banco de dados
    const editedMsg = await Message.findOne({ 
	where: { messageId: msg.id.id },
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

    if (!editedMsg) {
      return;
    }

    // Atualizar o campo 'edited'
    await editedMsg.update({ edited: newBody });
	
	const { ticket } = editedMsg;
	   socketEmit({
       tenantId: ticket.tenantId,
       type: "chat:update",
       payload: editedMsg
      });

  } catch (err) {
    console.error(`Erro ao manipular a edição da mensagem com ID ${msg.id.id}. Erro: ${err}`);
  }
}

export default handleMsgEdit;
