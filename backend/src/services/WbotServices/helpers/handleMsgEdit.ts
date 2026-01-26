import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";
import { logger } from "../../../utils/logger";

const handleMsgEdit = async (
  msg: WbotMessage,
  newBody: string
): Promise<void> => {
  try {
    // Buscar a mensagem no banco de dados com todas as relações necessárias
    const editedMsg = await Message.findOne({
      where: { messageId: msg.id.id },
      include: [
        "contact",
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

    if (!editedMsg) {
      return;
    }

    // Atualizar o campo 'edited'
    await editedMsg.update({ edited: newBody });

    // Buscar a mensagem atualizada com todas as relações
    const updatedMessage = await Message.findByPk(editedMsg.id, {
      include: [
        "contact",
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
      logger.error(`Ticket não encontrado para mensagem editada: ${editedMsg.id}`);
      return;
    }

    // Emitir evento via socket
    socketEmit({
      tenantId: updatedMessage.ticket.tenantId,
      type: "chat:update",
      payload: {
        ...updatedMessage.toJSON(),
        edited: newBody
      }
    });

  } catch (err) {
    console.error(`Erro ao manipular a edição da mensagem com ID ${msg.id.id}. Erro: ${err}`);
  }
}

export default handleMsgEdit;
