import { Request, Response } from "express";
import { Op } from "sequelize";
// import GetWbotMessage from "../helpers/GetWbotMessage";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowLogTicketService from "../services/TicketServices/ShowLogTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";
import { pupa } from "../utils/pupa";

/**
 * Interface para parâmetros de busca e filtro de tickets
 */
type IndexQuery = {
  searchParam: string;         // Termo de busca
  pageNumber: string;         // Número da página atual
  status: string[];          // Lista de status para filtrar
  date: string;             // Data para filtro
  showAll: string;          // Exibir todos os tickets
  withUnreadMessages: string; // Apenas com mensagens não lidas
  queuesIds: string[];      // IDs das filas para filtrar
  isNotAssignedUser: string; // Não atribuídos a usuários
  includeNotQueueDefined: string; // Incluir sem fila definida
  tags: string[];
};

/**
 * Interface que define a estrutura de dados de um ticket
 */
interface TicketData {
  contactId: number;         // ID do contato associado
  status: string;           // Status atual do ticket
  userId: number;           // ID do usuário responsável
  isActiveDemand: boolean;  // Se é uma demanda ativa
  tenantId: string | number; // ID do tenant/organização
  channel: string;          // Canal de comunicação
  channelId?: number;       // ID do canal específico
}

/**
 * Lista tickets com base nos filtros fornecidos
 * 
 * Este endpoint retorna tickets paginados e a contagem total de tickets
 * que atendem aos critérios de busca especificados.
 */
/**
 * Lista tickets com base nos filtros fornecidos
 * 
 * Este endpoint retorna tickets paginados e a contagem total de tickets
 * que atendem aos critérios de busca especificados. Ele utiliza os parâmetros
 * de busca fornecidos pelo usuário para filtrar os tickets de acordo com
 * critérios como status, data e se possuem mensagens não lidas.
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, profile } = req.user;
  const {
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined,
    tags
  } = req.query as IndexQuery;

  const userId = req.user.id;

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined,
    tenantId,
    profile,
    tags
  });

  return res.status(200).json({ tickets, count, hasMore });
};

/**
 * Cria um novo ticket
 * Se não houver usuário associado, emite evento via socket
 */
/**
 * Cria um novo ticket
 * 
 * Este endpoint permite a criação de um novo ticket no sistema. Ele recebe
 * os dados do ticket através do corpo da requisição e, se não houver um
 * usuário associado, emite um evento via socket para notificar a criação.
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { contactId, status, userId, channel, channelId }: TicketData =
    req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    tenantId,
    channel,
    channelId
  });

  // se ticket criado pelo próprio usuário, não emitir socket.
  if (!userId) {
    const io = getIO();
    io.to(`${tenantId}:${ticket.status}`).emit(`${tenantId}:ticket`, {
      action: "create",
      ticket
    });
  }

  return res.status(200).json(ticket);
};

/**
 * Exibe detalhes de um ticket específico
 * Inclui mensagens agendadas e registra acesso no log
 */
/**
 * Exibe detalhes de um ticket específico
 * 
 * Este endpoint retorna as informações detalhadas de um ticket, incluindo
 * mensagens agendadas e registra o acesso no log. Ele busca o ticket pelo
 * ID fornecido na requisição e anexa as mensagens agendadas ao objeto do ticket.
 */
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userId = req.user.id;

  const ticket = await ShowTicketService({ id: ticketId, tenantId });
  // const messages = await Message.findAll({
  //   where: {
  //     fromMe: true,
  //     ticketId: ticket.id,
  //     ack: 0,
  //     messageId: { [Op.not]: null }
  //   },
  //   logging: console.log
  // });
  // if (messages) {
  //   await Promise.all(
  //     messages.map(async message => {
  //       console.info(message);
  //       const msg = await GetWbotMessage(ticket, message.messageId);
  //       console.log(msg);
  //     })
  //   );
  // }
  const where = {
    contactId: ticket.contactId,
    scheduleDate: { [Op.not]: null },
    status: "pending"
  };
  const scheduledMessages = await Message.findAll({
    where
    // logging: console.log
  });

  ticket.setDataValue("scheduledMessages", scheduledMessages);

  await CreateLogTicketService({
    userId,
    ticketId,
    type: "access"
  });

  return res.status(200).json(ticket);
};

/**
 * Atualiza um ticket existente
 * Se fechado, pode enviar mensagem de despedida configurada
 */
/**
 * Atualiza um ticket existente
 * 
 * Este endpoint permite modificar a estrutura e configurações de um ticket
 * existente. Se o ticket estiver fechado, pode enviar uma mensagem de
 * despedida configurada para o usuário.
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userIdRequest = req.user.id;
  const { isTransference } = req.body;

  const ticketData: TicketData = { ...req.body, tenantId };

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    isTransference,
    userIdRequest
  });

  if (ticket.status === "closed") {
    const whatsapp = await Whatsapp.findOne({
      where: { id: ticket.whatsappId, tenantId }
    });
    if (whatsapp?.farewellMessage) {
      const body = pupa(whatsapp.farewellMessage || "", {
        protocol: ticket.protocol,
        name: ticket.contact.name
      });
      const messageData = {
        msg: { body, fromMe: true, read: true },
        tenantId,
        ticket,
        userId: req.user.id,
        sendType: "bot",
        status: "pending",
        isTransfer: false,
        note: false
      };
      await CreateMessageSystemService(messageData);
      ticket.update({ isFarewellMessage: true });
    }
  }

  return res.status(200).json(ticket);
};

/**
 * Remove um ticket do sistema
 * Notifica remoção via socket para atualização em tempo real
 */
/**
 * Remove um ticket do sistema
 * 
 * Este endpoint exclui permanentemente um ticket do sistema e notifica
 * a remoção via socket para atualização em tempo real. Isso garante que
 * todos os usuários conectados recebam a atualização imediatamente.
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userId = req.user.id;

  const ticket = await DeleteTicketService({ id: ticketId, tenantId, userId });

  const io = getIO();
  io.to(`${tenantId}:${ticket.status}`)
    .to(`${tenantId}:${ticketId}`)
    .to(`${tenantId}:notification`)
    .emit(`${tenantId}:ticket`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};

/**
 * Exibe o histórico de logs de um ticket
 * Útil para auditoria e acompanhamento de mudanças
 */
/**
 * Exibe o histórico de logs de um ticket
 * 
 * Este endpoint retorna todos os logs associados a um ticket específico,
 * permitindo auditoria e acompanhamento de mudanças ao longo do tempo.
 */
export const showLogsTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const logsTicket = await ShowLogTicketService({ ticketId });

  return res.status(200).json(logsTicket);
};
