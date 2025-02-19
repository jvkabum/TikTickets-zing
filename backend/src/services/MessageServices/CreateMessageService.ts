import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";
import HandleMessageReceivedService from "./HandleMessageReceivedService";
import ManageTicketStatusService from "../TicketServices/ManageTicketStatusService";

interface MessageData {
  id?: string;
  messageId: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp?: number;
  quotedMsgId?: string;
  status?: string;
  pollData?: {
    name: string;
    options: Array<{
      name: string;
      localId?: string;
      votes?: number;
    }>;
    selectionAmount?: number;
    allowMultipleAnswers?: boolean;
    votes?: Array<{
      selectedOptions: string[];
      sender: string;
      parentMessageId?: string;
      timestamp?: number;
    }>;
  };
}

interface Request {
  messageData: MessageData;
  tenantId: string | number;
}

const CreateMessageService = async ({
  messageData,
  tenantId
}: Request): Promise<Message> => {
  // Removido: console.log("Iniciando CreateMessageService:", {...});

  const msg = await Message.findOne({
    where: { messageId: messageData.messageId, tenantId }
  });

  if (!msg) {
    // Removido: console.log("Criando nova mensagem...");
    await Message.create({ ...messageData, tenantId });
  } else {
    // Removido: console.log("Atualizando mensagem existente...");
    await msg.update(messageData);
  }

  const message = await Message.findOne({
    where: { messageId: messageData.messageId, tenantId },
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    console.error("Mensagem não encontrada após criação");
    throw new Error("ERR_CREATING_MESSAGE");
  }

  // Removido: console.log("Mensagem salva:", {...});

  // Gerenciar status do ticket apenas se a mensagem tiver um ticket associado
  if (message.ticket) {
    // Removido: console.log("Gerenciando status do ticket...");
    const manageTicketStatus = new ManageTicketStatusService();
    await manageTicketStatus.execute({
      messageId: message.messageId,
      tenantId: Number(tenantId)
    });
  }

  // Processar auto-tag para qualquer mensagem que tenha ticket e contato
  if (message.ticket && message.ticket.contact) {
    // Removido: console.log("Processando auto-tag...");
    const handleMessageReceived = new HandleMessageReceivedService();
    await handleMessageReceived.execute({
      message,
      contact: message.ticket.contact,
      tenantId: Number(tenantId)
    });
  }

  // Removido: console.log("Emitindo evento socket...");
  socketEmit({
    tenantId,
    type: "chat:create",
    payload: message
  });

  return message;
};

export default CreateMessageService;
