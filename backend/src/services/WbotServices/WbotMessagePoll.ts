// Importações corrigidas
import { Client, MessageTypes, Poll, Message as WbotMessage } from "whatsapp-web.js"; // Import Poll e Message
import HandleMessage from "./helpers/HandleMessage";
import HandleMsgAck from "./helpers/HandleMsgAck";
import VerifyCall from "./VerifyCall";
import handleMsgEdit from "./helpers/handleMsgEdit";
import Contact from "../../models/Contact"; // Importar o modelo Contact
import Ticket from "../../models/Ticket"; // Importar o modelo Ticket
import Message from "../../models/Message"; // Importar o modelo Message
import CreateMessageService from "../MessageServices/CreateMessageService";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

// Definir os tipos e interfaces no topo e exportá-los
export type CustomMessageTypes = MessageTypes | "poll_creation" | "poll_vote";

export interface ExtendedWbotMessage extends Omit<WbotMessage, 'type'> {
  type: CustomMessageTypes;
  _data?: {
    id: {
      fromMe: boolean;
      remote: string;
      id: string;
      _serialized: string;
    };
    viewed: boolean;
    type: string;
    t: number;
    notifyName: string;
    from: string;
    to: string;
    ack: number;
    isNewMsg: boolean;
    pollName: string;
    pollOptions: Array<{ name: string }>;
    pollSelectableOptionsCount: number;
    pollInvalidated: boolean;
    pollContentType: string;
    messageSecret: Record<string, number>;
    title?: string;
    multipleAnswers?: boolean;
    voter?: string;
    selectedOptions?: Array<{ name: string }>;
    parentMessage?: { id: { id: string } };
    dadosCompletos?: string | Array<any>;
  };
}

export interface PollOption {
  name: string;
  localId: number;
  votes?: number;
}

export interface PollMessageData {
  messageId: string;
  ticketId: number;
  contactId?: number;
  body: string;
  fromMe: boolean;
  mediaType: string;
  read: boolean;
  timestamp: number;
  status: string;
  pollData: {
    name: string;
    options: Array<{
      name: string;
      localId: string;
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

// Funções existentes (handlePollCreation e handlePollVote) com logs removidos
const handlePollCreation = async (
  msg: ExtendedWbotMessage,
  ticket: Ticket,
  contact: Contact,
  wbot?: Client
) => {
  // Removido: console.log("Iniciando handlePollCreation:", {...});

  // Removido: console.log("Dados brutos recebidos:", {...});

  let pollOptions: Array<{ name: string; localId: number }> = [];
  try {
    if (!msg._data) {
      console.error("Nenhum dado encontrado na mensagem");
      throw new Error("Dados da enquete não encontrados");
    }

    if (Array.isArray(msg._data.pollOptions)) {
      // Removido: console.log("Usando pollOptions da mensagem");
      pollOptions = msg._data.pollOptions.map((opt: any, index: number) => ({
        name: opt.name || `Opção ${index + 1}`,
        localId: index
      }));
    } else if (msg._data.dadosCompletos) {
      // Removido: console.log("Usando dadosCompletos");
      if (typeof msg._data.dadosCompletos === 'string') {
        const parsedData = JSON.parse(msg._data.dadosCompletos);
        if (Array.isArray(parsedData)) {
          pollOptions = parsedData.map((opt: any, index: number) => ({
            name: opt.name || `Opção ${index + 1}`,
            localId: index
          }));
        }
      }
    }

    // Removido: console.log("Opções parseadas:", pollOptions);

    if (pollOptions.length === 0) {
      console.warn("Nenhuma opção válida encontrada");
      throw new Error("Nenhuma opção válida encontrada na enquete");
    }
  } catch (error) {
    console.error("Erro ao parsear opções:", error);
    throw error;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const pollData = {
    name: msg._data?.pollName || "Enquete",
    votes: [],
    options: pollOptions.map(opt => ({
      name: opt.name,
      votes: 0,
      localId: String(opt.localId)
    })),
    selectionAmount: msg._data?.pollSelectableOptionsCount || 1
  };

  // Determinar o contactId com base no destinatário (msg.to) quando enviado pelo bot
  let recipientContactId: number | undefined;
  if (msg.fromMe) {
    // Se o bot enviou a enquete, associa ao destinatário (msg.to)
    let recipientNumber: string;

    if (msg.to.endsWith("@lid") && wbot) {
      const recipientContactWbot = await wbot.getContactById(msg.to);
      recipientNumber = recipientContactWbot?.number || msg.to.replace('@lid', '').split('@')[0];
    } else {
      recipientNumber = msg.to.replace('@c.us', '').replace('@g.us', '');
    }

    let recipientContact = await Contact.findOne({
      where: { number: recipientNumber, tenantId: ticket.tenantId }
    });

    if (!recipientContact) {
      // Removido: console.log("Criando novo contato para o destinatário...");
      recipientContact = await Contact.create({
        number: recipientNumber,
        name: `Contato ${recipientNumber}`, // Nome padrão, pode ser ajustado
        tenantId: ticket.tenantId
      });
    }
    recipientContactId = recipientContact.id;
  } else {
    // Se o cliente enviou a enquete, mantém o contactId do remetente (funciona corretamente)
    recipientContactId = contact.id;
  }

  const messageData: PollMessageData = {
    messageId: msg.id.id,
    ticketId: ticket.id,
    contactId: recipientContactId, // Usa o contactId do destinatário ou remetente, dependendo de quem enviou
    body: `📊 ${pollData.name}¶¶Opções:${pollData.options.map(opt => `¶- ${opt.name} (${opt.votes} votos)`).join("")}`,
    fromMe: msg.fromMe,
    mediaType: "poll_creation",
    read: msg.fromMe,
    timestamp: msg.timestamp || currentTimestamp,
    status: "received",
    pollData: pollData
  };

  try {
    // Removido: console.log("Tentando salvar mensagem com dados:", JSON.stringify(messageData, null, 2));

    const savedMessage = await CreateMessageService({
      messageData,
      tenantId: ticket.tenantId
    });

    // Removido: console.log("Mensagem salva com sucesso:", {...});

    await ticket.update({
      lastMessage: `Enquete: ${pollData.name}`,
      lastMessageAt: currentTimestamp,
      answered: msg.fromMe,
      unreadMessages: msg.fromMe ? ticket.unreadMessages : ticket.unreadMessages + 1
    });

    // Removido: console.log("Ticket atualizado:", {...});

    return savedMessage;
  } catch (error) {
    console.error("Erro ao salvar enquete:", {
      message: error.message,
      stack: error.stack,
      messageData: JSON.stringify(messageData, null, 2)
    });
    throw error;
  }
};

const handlePollVote = async (
  msg: ExtendedWbotMessage,
  ticket: Ticket,
  contact: Contact,
  wbot?: Client
) => {
  // Removido: console.log("Iniciando handlePollVote:", {...});

  // Removido: console.log("Dados completos da mensagem de voto:", {...});

  try {
    // Verifica o ID da mensagem pai (enquete original)
    if (!msg._data || !msg._data.parentMessage?.id?.id) {
      console.error("ID da mensagem pai não encontrado na mensagem de voto");
      return;
    }
    const parentMessageId = msg._data.parentMessage.id.id;

    // Busca a mensagem da enquete original
    const pollMessage = await Message.findOne({
      where: {
        messageId: parentMessageId,
        tenantId: ticket.tenantId
      }
    });

    if (!pollMessage) {
      console.error("Mensagem da enquete não encontrada para parentMessageId:", parentMessageId);
      return;
    }

    if (!pollMessage.pollData) {
      console.error("pollData não encontrado na mensagem da enquete:", parentMessageId);
      return;
    }

    // Removido: console.log("pollData original encontrado:", JSON.stringify(pollMessage.pollData, null, 2));

    // Extrai os votos existentes e as opções selecionadas
    const updatedVotes = Array.isArray(pollMessage.pollData.votes) ? [...pollMessage.pollData.votes] : [];
    const selectedOptions = msg._data && Array.isArray(msg._data.selectedOptions)
      ? msg._data.selectedOptions.map(opt => opt.name).filter(name => name)
      : [];

    if (selectedOptions.length === 0) {
      console.warn("Nenhuma opção selecionada encontrada no voto");
      return;
    }

    let sender = msg._data?.voter || msg.from;

    // Tratamento de LID para sender
    if (sender.endsWith('@lid')) {
      if (wbot) {
        const senderContact = await wbot.getContactById(sender);
        sender = senderContact?.number || sender.replace('@lid', '').split('@')[0];
      } else {
        sender = sender.replace('@lid', '').split('@')[0];
      }
    } else {
      sender = sender.replace('@c.us', '').replace('@g.us', '');
    }

    // Cria o objeto de dados do voto
    const voteData = {
      sender, // Padroniza o sender
      selectedOptions,
      parentMessageId,
      timestamp: msg.timestamp || Math.floor(Date.now() / 1000)
    };

    // Verifica se o sender já votou e atualiza ou adiciona o voto
    const existingVoteIndex = updatedVotes.findIndex(v => v.sender === voteData.sender);
    if (existingVoteIndex >= 0) {
      // Removido: console.log("Atualizando voto existente para sender:", voteData.sender);
      updatedVotes[existingVoteIndex] = voteData;
    } else {
      // Removido: console.log("Adicionando novo voto para sender:", voteData.sender);
      updatedVotes.push(voteData);
    }

    // Atualiza a contagem de votos nas opções
    const updatedOptions = pollMessage.pollData.options.map(option => ({
      ...option,
      localId: String(option.localId),
      votes: updatedVotes.filter(vote => vote.selectedOptions.includes(option.name)).length
    }));

    const updatedPollData = {
      ...pollMessage.pollData,
      options: updatedOptions,
      votes: updatedVotes,
      selectionAmount: pollMessage.pollData.selectionAmount || 1
    };

    // Removido: console.log("Atualizando pollData com voto:", JSON.stringify(updatedPollData, null, 2));
    await pollMessage.update({ pollData: updatedPollData });
    // Removido: console.log("pollData atualizado com sucesso no banco para mensagem:", parentMessageId);

    // Cria uma mensagem separada para registrar o voto
    const voteMessageData: PollMessageData = {
      messageId: msg.id.id,
      ticketId: ticket.id,
      contactId: contact.id,
      body: `Votou em: ${selectedOptions.join(", ")}`,
      fromMe: false,
      mediaType: "poll_vote",
      read: false,
      timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
      status: "received",
      pollData: {
        ...updatedPollData,
        options: updatedPollData.options.map(opt => ({
          ...opt,
          localId: String(opt.localId)
        }))
      }
    };

    // Removido: console.log("Salvando mensagem de voto:", JSON.stringify(voteMessageData, null, 2));
    const savedVoteMessage = await CreateMessageService({
      messageData: voteMessageData,
      tenantId: ticket.tenantId
    });

    // Removido: console.log("Mensagem de voto salva com sucesso:", {...});

    // Atualiza o ticket com a última interação
    await ticket.update({
      lastMessage: `Votou em: ${selectedOptions.join(", ")}`,
      lastMessageAt: voteMessageData.timestamp,
      unreadMessages: ticket.unreadMessages + 1
    });

    // Removido: console.log("Ticket atualizado após voto:", {...});

    // Removido: console.log("Voto registrado com sucesso para mensagem:", msg.id.id);
  } catch (error) {
    console.error("Erro ao processar voto:", {
      message: error.message,
      stack: error.stack,
      messageId: msg.id.id
    });
    throw error;
  }
};

// Exportar apenas as funções (não os tipos novamente, pois já foram exportados no topo)
export { handlePollCreation, handlePollVote };
