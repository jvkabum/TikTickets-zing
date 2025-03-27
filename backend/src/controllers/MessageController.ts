/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import AppError from "../errors/AppError";
import DeleteMessageSystem from "../helpers/DeleteMessageSystem";
// import GetTicketWbot from "../helpers/GetTicketWbot";
import FastReply from "../models/FastReply";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../models/Message";
import CreateForwardMessageService from "../services/MessageServices/CreateForwardMessageService";
// import CreateMessageOffilineService from "../services/MessageServices/CreateMessageOfflineService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import { logger } from "../utils/logger";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
// import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
// import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";

/**
 * Interface para parâmetros de paginação na listagem de mensagens
 */
type IndexQuery = {
  pageNumber: string;  // Número da página atual
};

/**
 * Interface que define a estrutura de uma mensagem
 */
type MessageData = {
  body: string;         // Corpo/conteúdo da mensagem
  fromMe: boolean;      // Indica se a mensagem foi enviada pelo usuário atual
  read: boolean;        // Status de leitura da mensagem
  sendType?: string;    // Tipo de envio (chat, campanha, etc)
  scheduleDate?: string | Date;  // Data/hora agendada para envio
  quotedMsg?: Message;  // Mensagem que está sendo respondida/citada
  idFront?: string;     // ID temporário usado no frontend
};

/**
 * Verifica a conexão do WhatsApp
 */
export const checkWhatsAppConnection = async (whatsappId: number | string, tenantId: string): Promise<boolean> => {
  const whatsapp = await ShowWhatsAppService({ id: whatsappId, tenantId });
  if (whatsapp.status !== "CONNECTED") {
    logger.error(`Sessão do WhatsApp ${whatsappId} não está conectada. Tentando reconectar...`);
    // Lógica de reconexão aqui (substitua pelo método real de reconexão)
    return false;
  }
  return true;
}

/**
 * Lista as mensagens de um ticket específico
 * Retorna mensagens paginadas, incluindo mensagens offline e status do ticket
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { tenantId } = req.user;

  const { count, messages, messagesOffLine, ticket, hasMore } =
    await ListMessagesService({
      pageNumber,
      ticketId,
      tenantId
    });

  try {
    const isConnected = await checkWhatsAppConnection(ticket.whatsappId, String(tenantId));
    if (!isConnected) {
      throw new AppError("A sessão do WhatsApp não está conectada. Por favor, reconecte a sessão.", 400);
    }
    SetTicketMessagesAsRead(ticket);
  } catch (error) {
    logger.error(`Erro ao marcar mensagens como lidas no ticket ${ticketId}: ${error}`);
  }

  return res.json({ count, messages, messagesOffLine, ticket, hasMore });
};

/**
 * Armazena uma nova mensagem
 * Processa o envio de mensagens com ou sem mídia, incluindo respostas rápidas
 * Se a mensagem contiver ID de resposta rápida, busca e anexa a mídia correspondente
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId, id: userId } = req.user;
  const messageData: MessageData = req.body; // Pegando a mensagem completa do corpo da requisição
  const medias = (req.files as Express.Multer.File[]) || [];
  const ticket = await ShowTicketService({ id: ticketId, tenantId });

  // Verifica se a sessão do whatsapp está conectada
  const whatsapp = await ShowWhatsAppService({ id: ticket.whatsappId, tenantId });
  if (whatsapp.status !== "CONNECTED") {
    logger.error(`Sessão do WhatsApp ${ticket.whatsappId} não está conectada.`);
    throw new AppError("A sessão do WhatsApp não está conectada. Por favor, reconecte a sessão.", 400);
  }

  // Extraindo o ID da mensagem do corpo (assumindo o formato "[ID] mensagem")
  let idMessagem = messageData.body.split("] - ")[0];
  idMessagem = idMessagem.replace("[", "").replace("]", "");

  // Tenta converter idMessagem para número
  const parsedIdMessagem = parseInt(idMessagem, 10);

  if (isNaN(parsedIdMessagem)) {
    // Se o ID não for um número válido, registrar o erro ou continuar sem buscar FastReply
    //console.error(`ID da mensagem rapida inválido: ${idMessagem}`);
  } else {
    try {
      const fastReply = await FastReply.findOne({
        where: { id: parsedIdMessagem }
      });

      if (fastReply) {
        // Se o fastReply tiver mídias, adiciona a primeira mídia à lista de medias
        if (fastReply.medias && fastReply.medias.length > 0) {
          const mediaUrl = fastReply.medias[0]; // Supondo que a URL seja algo como "/public/uploads/logoestilo.jpg"
          const mediaFile = await getMediaFileFromServer(mediaUrl);
          if (mediaFile) {
            medias.push(mediaFile); // Adiciona o arquivo diretamente na lista de mídias
          }

          // Atualiza o texto do ticket para ser usado como legenda
          if (fastReply.message) {
            await ticket.update({
              lastMessage: fastReply.message
            });
          }

          // Envia a mensagem com ou sem mídias
          await CreateMessageSystemService({
            msg: messageData,
            tenantId,
            medias, // Enviando as mídias atualizadas (incluso o arquivo do fastReply se houver)
            ticket,
            userId,
            scheduleDate: messageData.scheduleDate,
            sendType: messageData.sendType || "chat",
            status: "pending",
            idFront: messageData.idFront
          });
          return res.send();
        }
      }
    } catch (error) {
      logger.error(`Erro ao buscar FastReply: ${error}`);
    }
  }

  // Envia a mensagem com ou sem mídias
  try {
    const messagePayload: any = {
      msg: messageData,
      tenantId,
      ticket,
      userId,
      scheduleDate: messageData.scheduleDate,
      sendType: messageData.sendType || "chat",
      status: "pending",
      idFront: messageData.idFront
    };

    // Verifica se 'medias' contém algum arquivo. Se não, não adiciona ao payload.
    if (medias.length > 0) {
      messagePayload.medias = medias; // Adiciona apenas se houver mídias
    }

    await CreateMessageSystemService(messagePayload);

    return res.send();
  } catch (error) {
    logger.error(`Erro ao criar a mensagem: ${error}`);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Remove uma mensagem específica
 * Deleta a mensagem tanto do sistema quanto do WhatsApp quando possível
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { tenantId } = req.user;
  try {
    await DeleteMessageSystem(req.body.id, messageId, tenantId);
  } catch (error) {
    logger.error(`Erro ao deletar mensagem do sistema: ${error}`);
    throw new AppError("Erro ao deletar mensagem do sistema");
  }

  return res.send();
};

/**
 * Encaminha mensagens para outros contatos
 * Permite encaminhar múltiplas mensagens para um contato específico
 */
export const forward = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body;
  const { user } = req;

  for (const message of data.messages) {
    await CreateForwardMessageService({
      userId: user.id,
      tenantId: user.tenantId,
      message,
      contact: data.contact,
      ticketIdOrigin: message.ticketId
    });
  }

  return res.send();
};

/**
 * Edita uma mensagem existente
 * Atualiza o conteúdo da mensagem tanto no sistema quanto no WhatsApp
 */
export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { tenantId } = req.user;
  const { body }: MessageData = req.body;
  try {
    await EditWhatsAppMessage(req.body.id, messageId, tenantId, body);
  } catch (error) {
    if (error instanceof AppError && error.message === "ERR_EDITING_WAPP_MSG") {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }

  return res.send();
};

// Função para pegar um arquivo no servidor baseado na URL já existente
/**
 * Recupera um arquivo de mídia do servidor
 * Busca e prepara arquivos de mídia para envio baseado na URL fornecida
 */
export const getMediaFileFromServer = async (
  mediaUrl: string
): Promise<any> => {
  try {
    // Supondo que o caminho do arquivo já seja relativo à pasta `public`
    const fileName = path.basename(mediaUrl); // Extrai o nome do arquivo da URL
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      fileName
    ); // Monta o caminho completo do arquivo no servidor

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error("Arquivo não encontrado no servidor.");
    }

    // Pega o tipo MIME do arquivo
    const mimetype = mime.lookup(filePath) || "application/octet-stream"; // Garante que tenha um fallback caso o tipo não seja encontrado

    // Retorna um objeto no formato esperado (semelhante ao Multer)
    return {
      originalname: fileName, // Nome do arquivo
      filename: fileName, // Nome salvo
      path: filePath, // Caminho completo do arquivo no servidor
      mimetype: mimetype || "application/octet-stream" // Tipo do arquivo
    };
  } catch (error) {
    logger.error(`Erro ao buscar o arquivo no servidor: ${error.message}`);
    throw new Error(`Erro ao buscar o arquivo no servidor: ${error.message}`);
  }
};
