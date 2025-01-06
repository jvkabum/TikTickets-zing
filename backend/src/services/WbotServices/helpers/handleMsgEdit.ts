import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import socketEmit from "../../../helpers/socketEmit";

const handleMsgEdit = async (
  msg: WbotMessage,
  newBody: string
): Promise<void> => {
  
  try {
    // Buscar a mensagem no banco de dados
    const editedMsg = await Message.findOne({ where: { messageId: msg.id.id } });

    if (!editedMsg) {
      return;
    }

    // Atualizar o campo 'edited'
    await editedMsg.update({ edited: newBody });
	
    // falta socket emitir pro frontend

  } catch (err) {
    console.error(`Erro ao manipular a edição da mensagem com ID ${msg.id.id}. Erro: ${err}`);
  }
}

export default handleMsgEdit;
