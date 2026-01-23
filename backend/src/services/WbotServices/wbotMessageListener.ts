import { Client, MessageTypes, Poll } from "whatsapp-web.js";
import HandleMessage from "./helpers/HandleMessage";
import HandleMsgAck from "./helpers/HandleMsgAck";
import VerifyCall from "./VerifyCall";
import handleMsgEdit from "./helpers/handleMsgEdit";
import { handlePollCreation, handlePollVote, ExtendedWbotMessage } from "./WbotMessagePoll";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { Op } from "sequelize";
import Whatsapp from "../../models/Whatsapp";
import emitEvent from "../../helpers/socketEmit";
import { logger } from "../../utils/logger";

interface Session extends Client {
  id: number;
}

interface PollVote {
  pollCreationMessageKey: {
    id: string;
    remote: string;
  };
  selectedOptions: Array<{
    name: string;
    localId: string;
  }>;
  senderTimestampMs?: number;
  voter?: string;
  getMessage(): Promise<ExtendedWbotMessage>;
}

// Função para enviar uma enquete
async function sendPoll(client: Client, chatId: string, pollName: string, options: string[]) {
  const poll = new Poll(pollName, options);
  await client.sendMessage(chatId, poll);
  if (client.interface && client.interface.openChatWindow) {
    await client.interface.openChatWindow(chatId);
  }
}

const wbotMessageListener = (wbot: Session): void => {
  // Listener para mensagens de criação e voto
  wbot.on("message_create", async (msg: ExtendedWbotMessage) => {
    if (msg.isStatus) return;

    if (msg.type === "poll_creation" || msg.type === "poll_vote") {
      try {
        let chat;
        try { chat = await msg.getChat(); } catch (e) {
          // Fallback se getChat falhar
          if (msg.to) {
            chat = { isGroup: msg.to.includes("@g.us"), id: { _serialized: msg.to } } as any;
          } else {
            return; // Impossível processar sem chat
          }
        }


        const wbotContact = await msg.getContact();
        const tenantId = await getTenantIdByWbotId(wbot.id);

        let contact: Contact;
        if (msg.fromMe) {
          // Se o bot enviou a enquete, associa ao destinatário (msg.to)
          const recipientNumber = msg.to.replace('@c.us', '');
          const recipientContact = await Contact.findOne({
            where: { number: recipientNumber, tenantId }
          });

          if (!recipientContact) {
            contact = await Contact.create({
              number: recipientNumber,
              name: `Contato ${recipientNumber}`,
              tenantId
            });
          } else {
            contact = recipientContact;
          }
        } else {
          // Se o cliente enviou, associa ao remetente (msg.from)
          const phoneNumber = wbotContact.id._serialized.replace('@c.us', '');
          const senderContact = await Contact.findOne({
            where: { number: phoneNumber, tenantId }
          });

          if (!senderContact) {
            contact = await Contact.create({
              number: phoneNumber,
              name: wbotContact.name || wbotContact.pushname || phoneNumber,
              tenantId
            });
          } else {
            contact = senderContact;
          }
        }

        let ticket = await Ticket.findOne({
          where: {
            contactId: contact.id,
            tenantId,
            status: { [Op.or]: ["open", "pending"] }
          }
        });

        if (!ticket) {
          ticket = await Ticket.create({
            contactId: contact.id,
            status: "open",
            tenantId,
            lastMessage: msg._data?.pollName || "Enquete",
            lastMessageAt: Math.floor(Date.now() / 1000)
          });
        }

        if (msg.type === "poll_creation") {
          await handlePollCreation(msg, ticket, contact);
        } else if (msg.type === "poll_vote") {
          await handlePollVote(msg, ticket, contact);
        }

        return;
      } catch (error) {
        logger.error(`Erro ao processar mensagem de enquete ou voto: ${error.message}`);
        return;
      }
    }

    HandleMessage(msg as any, wbot);
  });

  // Listener para uploads de mídia
  wbot.on("media_uploaded", async msg => {
    HandleMessage(msg, wbot);
  });

  // Listener para confirmações de mensagens
  wbot.on("message_ack", async (msg, ack) => {
    HandleMsgAck(msg, ack);
  });

  // Listener para edições de mensagens
  wbot.on("message_edit", async (msg, newBody, oldBody) => {
    handleMsgEdit(msg, newBody as string);
  });

  // Listener para chamadas
  wbot.on("call", async call => {
    VerifyCall(call, wbot);
  });

  wbot.on("vote_update", async (vote: PollVote) => {
    try {
      const msg = await vote.getMessage();
      if (!msg) {
        logger.error("Mensagem de enquete não encontrada para o voto");
        return;
      }

      const wbotContact = await msg.getContact();
      const tenantId = await getTenantIdByWbotId(wbot.id);
      const phoneNumber = wbotContact.id._serialized.replace('@c.us', '');

      let contact = await Contact.findOne({
        where: { number: phoneNumber, tenantId }
      });

      if (!contact) {
        contact = await Contact.create({
          number: phoneNumber,
          name: wbotContact.name || wbotContact.pushname || phoneNumber,
          tenantId
        });
      }

      let ticket = await Ticket.findOne({
        where: {
          contactId: contact.id,
          tenantId,
          status: { [Op.or]: ["open", "pending"] }
        }
      });

      if (!ticket) {
        ticket = await Ticket.create({
          contactId: contact.id,
          status: "open",
          tenantId,
          lastMessage: "Voto em enquete",
          lastMessageAt: Math.floor(Date.now() / 1000)
        });
      }

      await handlePollVote(msg, ticket, contact);

      // Emitir evento para o frontend via WebSocket
      // USO SEGURO: msg.id.id (obtido via getMessage()) em vez de vote.pollCreationMessageKey.id
      emitEvent({
        tenantId,
        type: "pollVoteUpdate",
        payload: {
          pollMessageId: msg.id.id,
          selectedOptions: vote.selectedOptions,
          voter: vote.voter,
          timestamp: vote.senderTimestampMs
        }
      });
    } catch (error) {
      logger.error(`Erro ao processar vote_update: ${error}`);
    }
  });

};

// Função auxiliar para obter o tenantId baseado no wbotId
const getTenantIdByWbotId = async (wbotId: number): Promise<number> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id: wbotId }
  });
  return whatsapp?.tenantId || 1;
};

// Exportar para uso em outros lugares, se necessário
export { wbotMessageListener, HandleMessage, sendPoll };
