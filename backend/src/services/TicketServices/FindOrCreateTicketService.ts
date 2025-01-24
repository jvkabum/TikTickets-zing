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
  // Obtém as configurações do banco de dados
  const settings = await ListSettingsService(tenantId);
  const ticketAction = settings?.find((s) => s.key === "ticketAction")?.value || "reopen"; // Padrão: reabrir tickets
  const ignoreGroupMsg =
    settings?.find((s) => s.key === "ignoreGroupMsg")?.value === "enabled";

  // Ignorar mensagens de grupos, se configurado
  if (ignoreGroupMsg && groupContact) {
    return { isIgnored: true, message: "Mensagens de grupo estão desativadas." };
  }

  // Verificar se é uma mensagem de campanha
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

  // Procurar tickets existentes
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
        include: ["extraInfo", "tags"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  // Verifica a lógica configurada: reabrir ou criar novo ticket
  if (ticketAction === "reopen") {
    // Se não encontrar tickets abertos ou pendentes, tenta encontrar tickets fechados
    if (!ticket) {
      ticket = await Ticket.findOne({
        where: {
          status: "closed", // Busca tickets fechados
          tenantId,
          whatsappId,
          contactId: groupContact ? groupContact.id : contact.id
        }
      });

      // Reabre ticket fechado
      if (ticket) {
        await ticket.update({
          status: "pending",
          unreadMessages
        });

        socketEmit({
          tenantId,
          type: "ticket:update",
          payload: ticket
        });

        return ticket;
      }
    }
  }

  // Se encontrar um ticket, atualiza o número de mensagens não lidas
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

  // Lógica para criar um novo ticket
  const ticketObj: any = {
    contactId: groupContact ? groupContact.id : contact.id,
    status: "pending",
    isGroup: !!groupContact,
    unreadMessages,
    whatsappId,
    tenantId,
    channel
  };

  const ticketCreated = await Ticket.create(ticketObj);

  await CreateLogTicketService({
    ticketId: ticketCreated.id,
    type: "create"
  });

  // Inicia o fluxo do chatbot se necessário
  if ((msg && !msg.fromMe) || isSync) {
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
