import { Op } from "sequelize";
import { Message } from "whatsapp-web.js";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import ShowTicketService from "./ShowTicketService";
import CampaignContacts from "../../models/CampaignContacts";
import socketEmit from "../../helpers/socketEmit";
import CheckChatBotFlowWelcome from "../../helpers/CheckChatBotFlowWelcome";
import CreateLogTicketService from "./CreateLogTicketService";
import MessageModel from "../../models/Message";
import ListSettingsService from "../SettingServices/ListSettingsService";

interface Data {
  contact: Contact;
  whatsappId: number;
  unreadMessages: number;
  tenantId: number | string;
  groupContact?: Contact;
  msg?: Message | any;
  isSync?: boolean;
  channel: string;
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  unreadMessages,
  tenantId,
  groupContact,
  msg,
  isSync,
  channel
}: Data): Promise<Ticket | any> => {
  // Se for uma mensagem de campanha, não abrir ticket
  if (msg && msg.fromMe) {
    const msgCampaign = await CampaignContacts.findOne({
      where: {
        contactId: contact.id,
        messageId: msg.id?.id || msg.message_id || msg.item_id
      }
    });
    if (msgCampaign?.id) {
      return { isCampaignMessage: true };
    }
  }

  if (msg && msg.fromMe) {
    const farewellMessage = await MessageModel.findOne({
      where: { messageId: msg.id?.id || msg.message_id || msg.item_id },
      include: ["ticket"]
    });

    if (
      farewellMessage?.ticket?.status === "closed" &&
      farewellMessage?.ticket.lastMessage === msg.body
    ) {
      const ticket = farewellMessage.ticket as any;
      ticket.isFarewellMessage = true;
      return ticket;
    }
  }

  // Tenta encontrar um ticket aberto ou pendente
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      tenantId,
      whatsappId,
      contactId: groupContact ? groupContact.id : contact.id
    },
    include: [
      {
        model: Contact,
        as: "contact",
        include: [
          "extraInfo",
          "tags",
          {
            association: "wallets",
            attributes: ["id", "name"]
          }
        ]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        association: "whatsapp",
        attributes: ["id", "name"]
      }
    ]
  });

  // Se não encontrar um ticket aberto ou pendente, tenta encontrar um ticket fechado
  if (!ticket) {
    ticket = await Ticket.findOne({
      where: {
        status: "closed", // Busca tickets fechados
        tenantId,
        whatsappId,
        contactId: groupContact ? groupContact.id : contact.id
      }
    });

    // Se encontrar um ticket fechado, reabra-o
    if (ticket) {
      await ticket.update({
        status: "pending", // Ou "open", dependendo da lógica do seu sistema
        unreadMessages
      });

      socketEmit({
        tenantId,
        type: "ticket:update",
        payload: ticket
      });

      return ticket; // Retorna o ticket reaberto
    }
  }

  // Se um ticket aberto ou pendente foi encontrado, atualiza o número de mensagens não lidas
  if (ticket) {
    if (!msg?.fromMe) {
      unreadMessages = ticket.unreadMessages + 1;
      await ticket.update({ unreadMessages });
    }
    socketEmit({
      tenantId,
      type: "ticket:update",
      payload: ticket
    });
    return ticket;
  }

  // Se não houver tickets, cria um novo
  const DirectTicketsToWallets =
    (await ListSettingsService(tenantId))?.find(
      s => s.key === "DirectTicketsToWallets"
    )?.value === "enabled" || false;

  const ticketObj: any = {
    contactId: groupContact ? groupContact.id : contact.id,
    status: "pending",
    isGroup: !!groupContact,
    unreadMessages,
    whatsappId,
    tenantId,
    channel
  };

  if (DirectTicketsToWallets && contact.id) {
    const wallet: any = contact;
    const wallets = await wallet.getWallets();
    if (wallets && wallets[0]?.id) {
      ticketObj.status = "open";
      ticketObj.userId = wallets[0].id;
      ticketObj.startedAttendanceAt = new Date().getTime();
    }
  }

  const ticketCreated = await Ticket.create(ticketObj);

  await CreateLogTicketService({
    ticketId: ticketCreated.id,
    type: "create"
  });

  // Verifica se a mensagem não é de você ou se o ticket não tem um usuário atribuído
  if ((msg && !msg.fromMe) || !ticketCreated.userId || isSync) {
    await CheckChatBotFlowWelcome(ticketCreated);
  }

  ticket = await ShowTicketService({ id: ticketCreated.id, tenantId });
  ticket.setDataValue("isCreated", true);

  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return ticket;
};

export default FindOrCreateTicketService;
