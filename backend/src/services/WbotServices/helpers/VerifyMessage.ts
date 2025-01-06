import { Message as WbotMessage } from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import CreateMessageService from "../../MessageServices/CreateMessageService";
import VerifyQuotedMessage from "./VerifyQuotedMessage";

const prepareLocation = (msg: WbotMessage): WbotMessage => {
  const gmapsUrl = `https://maps.google.com/maps?q=${msg.location.latitude}%2C${msg.location.longitude}&z=17`;
  msg.body = `${gmapsUrl}`;
  return msg;
};

const VerifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.type === "location") msg = prepareLocation(msg);

  const quotedMsg = await VerifyQuotedMessage(msg);

  const messageData = {
    messageId: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id,
    timestamp: msg.timestamp,
    status: "received"
  };
  
  await ticket.update({
    lastMessage:
      msg.type === "location"
        ? msg.location.options
          ? `Localization - ${msg.location.options}`
          : "Localization"
        : msg.body
  });

  await ticket.update({
    lastMessage: msg.body,
    lastMessageAt: new Date().getTime(),
    answered: msg.fromMe || false
  });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

export default VerifyMessage;
