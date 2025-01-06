import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { EventMessage } from "./MessengerTypes";

// Interface que estende o tipo de mensagem do Messenger
// Adiciona campos necessários para processamento interno
interface Message extends EventMessage {
  type: string;
  timestamp: number;
}

// Serviço responsável por processar mensagens de texto do Messenger
// Cria a mensagem no sistema e atualiza o status do ticket
const MessengerVerifyMessage = async (
  msg: Message | any,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  let quotedMsgId;
  if (msg?.message?.reply_to?.mid) {
    const messageQuoted = await getQuotedForMessageId(
      msg.message.reply_to.mid,
      ticket.tenantId
    );
    quotedMsgId = messageQuoted?.id || undefined;
  }

  const messageData = {
    messageId: msg.message_id || "",
    ticketId: ticket.id,
    contactId: contact.id,
    body: msg.message.text || "",
    fromMe: false,
    mediaType: msg.type,
    read: false,
    quotedMsgId,
    timestamp: msg.timestamp,
    status: "received"
  };

  await ticket.update({
    lastMessage: messageData.body,
    lastMessageAt: new Date().getTime(),
    answered: false
  });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

export default MessengerVerifyMessage;
