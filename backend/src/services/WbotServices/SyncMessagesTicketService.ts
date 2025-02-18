import { Client, Message as WbotMessage } from "whatsapp-web.js";
import { logger } from "../../utils/logger";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import VerifyContact from "./helpers/VerifyContact";
import VerifyMediaMessage from "./helpers/VerifyMediaMessage";
import VerifyMessage from "./helpers/VerifyMessage";
import { Op } from "sequelize";

interface Request {
  ticketId: number | string;
  tenantId: number | string;
  isSync?: boolean;
}

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 100;

// Função auxiliar para determinar o status da mensagem
const getMessageStatus = (msg: WbotMessage) => {
  if (!msg.fromMe) {
    return {
      ack: 3,
      status: "received"
    };
  }

  // Para mensagens enviadas por mim (fromMe = true)
  let ack = 3; // Padrão: enviado e recebido
  let status = "received";

  // Garante que mensagens enviadas sempre apareçam como entregues
  if (msg.ack >= 0) {
    ack = Math.max(msg.ack, 2); // Força no mínimo ack 2 para mensagens enviadas
    status = "received";
  }

  return { ack, status };
};

const SyncMessagesTicketService = async ({
  ticketId,
  tenantId,
  isSync = true
}: Request): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { id: ticketId, tenantId },
    include: ["contact", "whatsapp"]
  });

  if (!ticket) {
    throw new Error("ERR_NO_TICKET_FOUND");
  }

  const wbot = await GetTicketWbot(ticket);
  
  logger.info(
    `Obtendo chat para o contato ${ticket.contact.number}`
  );

  const chat = await wbot.getChatById(
    `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  );

  if (!chat) {
    throw new Error("ERR_NO_CHAT_FOUND");
  }

  try {
    logger.info(
      `Iniciando sincronização de todas as mensagens do contato ${ticket.contact.number}`
    );

    // Marca o chat como lido
    await chat.sendSeen();

    // Busca a última mensagem do WhatsApp
    const lastMessages = await chat.fetchMessages({ limit: 1 });
    if (!lastMessages || lastMessages.length === 0) {
      logger.info(
        `Nenhuma mensagem encontrada para ${ticket.contact.number}`
      );
      return;
    }

    const lastMessageId = lastMessages[0].id._serialized;
    logger.info(
      `Última mensagem do WhatsApp encontrada: ${lastMessageId}`
    );

    const allMessages: WbotMessage[] = [];
    let currentMessageId = lastMessageId;
    let attemptCount = 0;

    while (currentMessageId && attemptCount < MAX_ATTEMPTS) {
      logger.info(
        `Buscando lote ${attemptCount + 1} de mensagens para ${ticket.contact.number}`
      );

      const fetchOptions: any = { 
        limit: BATCH_SIZE,
        fromMe: undefined,
        id: currentMessageId
      };

      const messages = await chat.fetchMessages(fetchOptions);

      if (!messages || messages.length === 0) {
        break;
      }

      allMessages.push(...messages);
      attemptCount++;

      logger.info(
        `Carregadas ${allMessages.length} mensagens até agora do contato ${ticket.contact.number}`
      );

      currentMessageId = messages[messages.length - 1].id._serialized;

      if (messages.length < BATCH_SIZE) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(
      `Total de ${allMessages.length} mensagens encontradas para sincronizar do contato ${ticket.contact.number}`
    );

    // Coleta todos os IDs de mensagens do WhatsApp
    const whatsappMessageIds = allMessages.map(msg => msg.id._serialized);

    // Busca mensagens que já existem no banco
    const existingMessages = await Message.findAll({
      where: {
        messageId: {
          [Op.in]: whatsappMessageIds
        }
      }
    });

    // Cria um Set com os IDs das mensagens existentes para busca rápida
    const existingMessageIds = new Set(existingMessages.map(msg => msg.messageId));

    logger.info(
      `Encontradas ${existingMessages.length} mensagens já existentes no banco de dados`
    );

    let syncCount = 0;
    let skipCount = 0;

    // Atualiza mensagens existentes
    for (const msg of allMessages) {
      const messageId = msg.id._serialized;
      const { ack, status } = getMessageStatus(msg);
      
      logger.info(
        `Atualizando mensagem ${messageId}: fromMe=${msg.fromMe}, ack=${ack}, status=${status}`
      );

      if (existingMessageIds.has(messageId)) {
        await Message.update(
          { 
            read: true,
            ack,
            status,
            fromMe: msg.fromMe,
            delivered: true // Garante que a mensagem apareça como entregue
          },
          {
            where: {
              messageId,
              ticketId
            }
          }
        );
        skipCount++;
        continue;
      }

      try {
        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, ticket.contact);
        } else {
          await VerifyMessage(msg, ticket, ticket.contact);
        }

        // Atualiza o status da nova mensagem
        await Message.update(
          { 
            read: true,
            ack,
            status,
            fromMe: msg.fromMe,
            delivered: true // Garante que a mensagem apareça como entregue
          },
          {
            where: {
              messageId
            }
          }
        );

        syncCount++;

        if (syncCount % 5 === 0) {
          logger.info(
            `Progresso: ${syncCount} novas mensagens sincronizadas para o contato ${ticket.contact.number}`
          );
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        logger.error(
          `Erro ao sincronizar mensagem específica do ticket ${ticket.id}: ${err.message}`
        );
        continue;
      }
    }

    // Marca o chat como lido novamente para garantir
    await chat.sendSeen();

    // Força atualização final apenas do status de envio
    await Message.update(
      { 
        ack: 3,
        status: "received",
        delivered: true
      },
      {
        where: {
          ticketId,
          fromMe: true
        }
      }
    );

    logger.info(
      `Sincronização concluída para o contato ${ticket.contact.number}:
      - Total de mensagens encontradas: ${allMessages.length}
      - Mensagens já existentes: ${skipCount}
      - Novas mensagens sincronizadas: ${syncCount}`
    );
  } catch (err) {
    logger.error(
      `Erro ao sincronizar mensagens do ticket ${ticket.id}: ${err.message}`
    );
    throw err;
  }
};

export default SyncMessagesTicketService; 