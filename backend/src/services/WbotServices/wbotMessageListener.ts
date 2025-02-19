import { Client, MessageTypes, Poll } from "whatsapp-web.js"; // Import Poll
import HandleMessage from "./helpers/HandleMessage";
import HandleMsgAck from "./helpers/HandleMsgAck";
import VerifyCall from "./VerifyCall";
import handleMsgEdit from "./helpers/handleMsgEdit";
import { handlePollCreation, handlePollVote, ExtendedWbotMessage, CustomMessageTypes } from "./WbotMessagePoll";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { Op } from "sequelize";
import Whatsapp from "../../models/Whatsapp";
import emitEvent from "../../helpers/socketEmit"; // Renomeado para emitEvent

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
  await client.interface.openChatWindow(chatId); // Abre a janela do chat (opcional)
  // Removido: console.log(`Enquete enviada: ${pollName} para ${chatId}`);
}

const wbotMessageListener = (wbot: Session): void => {
  // Listener para mensagens de criação e voto
  wbot.on("message_create", async (msg: ExtendedWbotMessage) => {
    // Removido: console.log("Evento message_create recebido:", JSON.stringify({...}, null, 2));

    if (msg.isStatus) {
      // Removido: console.log("Ignorando mensagem de status broadcast");
      return;
    }

    // Removido: console.log("Tipo da mensagem:", msg.type);

    if (msg.type === "poll_creation" || msg.type === "poll_vote") {
      try {
        // Removido: console.log("Iniciando processamento de enquete ou voto...");
        const chat = await msg.getChat();
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
            // Removido: console.log("Criando novo contato para o destinatário...");
            contact = await Contact.create({
              number: recipientNumber,
              name: `Contato ${recipientNumber}`, // Nome padrão, pode ser ajustado
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
            // Removido: console.log("Criando novo contato para o remetente...");
            contact = await Contact.create({
              number: phoneNumber,
              name: wbotContact.name || wbotContact.pushname || phoneNumber,
              tenantId
            });
          } else {
            contact = senderContact;
          }
        }

        // Removido: console.log("Contato processado:", {...});

        let ticket = await Ticket.findOne({
          where: {
            contactId: contact.id,
            tenantId,
            status: { [Op.or]: ["open", "pending"] }
          }
        });

        if (!ticket) {
          // Removido: console.log("Criando novo ticket...");
          ticket = await Ticket.create({
            contactId: contact.id,
            status: "open",
            tenantId,
            lastMessage: msg._data?.pollName || "Enquete",
            lastMessageAt: Math.floor(Date.now() / 1000)
          });
        }

        // Removido: console.log("Ticket processado:", {...});

        if (msg.type === "poll_creation") {
          await handlePollCreation(msg, ticket, contact);
        } else if (msg.type === "poll_vote") {
          // Removido: console.log("Processando poll_vote via message_create:", JSON.stringify(msg, null, 2));
          await handlePollVote(msg, ticket, contact);
        }

        return;
      } catch (error) {
        console.error("Erro ao processar mensagem de enquete ou voto:", {
          message: error.message,
          stack: error.stack,
          msgDetails: JSON.stringify(msg, null, 2)
        });
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

  // Listener para atualizações de voto (vote_update) com processamento completo e depuração
  wbot.on("vote_update", async (vote: PollVote) => {
    // Removido: console.log("Evento vote_update recebido:", JSON.stringify(vote, null, 2));
    
    try {
      const msg = await vote.getMessage();
      if (!msg) {
        console.error("Mensagem de enquete não encontrada para o voto");
        return;
      }

      // Removido: console.log("Mensagem obtida via getMessage:", JSON.stringify(msg, null, 2));

      const wbotContact = await msg.getContact();
      const tenantId = await getTenantIdByWbotId(wbot.id);
      const phoneNumber = wbotContact.id._serialized.replace('@c.us', '');

      let contact = await Contact.findOne({
        where: { number: phoneNumber, tenantId }
      })!; // Usar ! para garantir que não é null (ou lidar com null adequadamente)

      if (!contact) {
        // Removido: console.log("Criando novo contato para voto...");
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
      })!; // Usar ! para garantir que não é null (ou lidar com null adequadamente)

      if (!ticket) {
        // Removido: console.log("Criando novo ticket para voto...");
        ticket = await Ticket.create({
          contactId: contact.id,
          status: "open",
          tenantId,
          lastMessage: "Voto em enquete",
          lastMessageAt: Math.floor(Date.now() / 1000)
        });
      }

      await handlePollVote(msg, ticket, contact);
      // Removido: console.log("Voto processado com sucesso via vote_update:", { messageId: msg.id.id });

      // Emitir evento para o frontend via WebSocket
      emitEvent({
        tenantId,
        type: "pollVoteUpdate",
        payload: {
          pollMessageId: vote.pollCreationMessageKey.id,
          selectedOptions: vote.selectedOptions,
          voter: vote.voter,
          timestamp: vote.senderTimestampMs
        }
      });
    } catch (error) {
      console.error("Erro ao processar vote_update:", {
        message: error.message,
        stack: error.stack,
        voteDetails: JSON.stringify(vote, null, 2)
      });
    }
  });

  // Adicionar o listener simples
  wbot.on('vote_update', (vote) => {
    console.log(vote);
  });

  // Listener genérico para depuração
  wbot.on('message', (msg) => {
    // Removido: console.log("Evento genérico de mensagem recebido:", JSON.stringify(msg, null, 2));
  });

  // Listener adicional para capturar todos os eventos para depuração
  wbot.on('any_event', (eventName, eventData) => {
    // Removido: console.log("Evento genérico capturado:", { eventName, eventData: JSON.stringify(eventData, null, 2) });
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
