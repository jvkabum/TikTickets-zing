import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import CreateLogTicketService from "./CreateLogTicketService";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Message from "../../models/Message";
import Protocol from "../../models/Protocol";
import socketEmit from "../../helpers/socketEmit";
import { format } from "date-fns";
import { Op } from "sequelize";

interface TicketData {
  status?: string;
  userId?: number;
  tenantId: number | string;
  queueId?: number | null;
  autoReplyId?: number | string | null;
  stepAutoReplyId?: number | string | null;
  autoClosed?: boolean;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  isTransference?: string | boolean | null;
  userIdRequest: number | string;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  isTransference,
  userIdRequest
}: Request): Promise<Response> => {
  const { status, tenantId, queueId } = ticketData;
  let { userId } = ticketData;

  const ticket = await Ticket.findOne({
    where: { id: ticketId, tenantId },
    include: [
      {
        model: Contact,
        as: "contact",
        include: ["extraInfo", "tags", { association: "wallets", attributes: ["id", "name"] }]
      },
      { model: User, as: "user", attributes: ["id", "name"] },
      { association: "whatsapp", attributes: ["id", "name"] },
      { model: Protocol, as: "protocols" }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await SetTicketMessagesAsRead(ticket);

  const toPending = ticket.status !== "pending" && ticketData.status === "pending";
  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  const statusData = status === "close" ? "closed" : status;

  const data: any = {
    status: statusData,
    queueId,
    userId
  };

  if (userId) {
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      console.log(`Usuário ID ${userId} não encontrado. Ticket não será atribuído.`);
      // Não atualizar o userId se o usuário não existir
      userId = undefined;
    }
  }

  try {
    const date = new Date();
    const currentDate = format(date, "dd/MM/yy");
    const currentTime = format(date, "HH:mm");

    const attendantName = userId ? (await User.findByPk(userId))?.name || "sistema" : "sistema";
    const requestingUser = await User.findByPk(userIdRequest);
    const requestingUserName = requestingUser?.name || "sistema";

    // Busca o último protocolo do ticket
    const lastProtocol = await Protocol.findOne({
      where: { ticketId: ticket.id },
      order: [["createdAt", "DESC"]]
    });

    // Busca o contador de atendimentos do ticket
    const attendanceCount = ticket.attendanceCount || 0;
    const newAttendanceCount = attendanceCount + 1;

    // Gera um novo número de protocolo com o contador simplificado
    const protocolNumber = `(${newAttendanceCount})-${ticket.id}`;

    if (oldStatus === "closed" && statusData === "open") {
      // Reabertura do ticket - cria novo protocolo
      await CheckContactOpenTickets(ticket.contact.id);
      
      await Protocol.create({
        protocolNumber,
        contactId: ticket.contactId,
        tenantId: ticket.tenantId,
        ticketId: ticket.id,
        userId: userIdRequest,
        userName: requestingUserName,
        status: "ABER"
      });

      // Atualiza o contador de atendimentos no ticket
      await ticket.update({ attendanceCount: newAttendanceCount });

      // Apenas mensagens novas receberão o novo protocolo
      // Mensagens antigas mantêm o protocolo anterior
    } else if (statusData === "closed") {
      data.closedAt = date.getTime();
      
      if (lastProtocol) {
        // Fecha o protocolo atual
        await Protocol.create({
          protocolNumber: lastProtocol.protocolNumber,
          contactId: ticket.contactId,
          tenantId: ticket.tenantId,
          ticketId: ticket.id,
          userId: userIdRequest,
          userName: requestingUserName,
          status: "FECH"
        });

        // Atualiza mensagens sem protocolo com o protocolo atual
        await Message.update(
          { protocolNumber: lastProtocol.protocolNumber },
          {
            where: {
              ticketId: ticket.id,
              protocolNumber: { [Op.or]: [null, ""] }
            }
          }
        );
      }
    } else if (oldStatus === "pending" && statusData === "open") {
      // Primeira abertura do ticket ou nova abertura
      data.autoReplyId = null;
      data.stepAutoReplyId = null;
      data.startedAttendanceAt = date.getTime();

      // Se não tem protocolo anterior, cria um novo
      if (!lastProtocol || lastProtocol.status === "FECH") {
        await Protocol.create({
          protocolNumber,
          contactId: ticket.contactId,
          tenantId: ticket.tenantId,
          ticketId: ticket.id,
          userId: userIdRequest,
          userName: requestingUserName,
          status: "ABER"
        });

        // Atualiza o contador de atendimentos no ticket
        await ticket.update({ attendanceCount: newAttendanceCount });

        // Atualiza apenas mensagens sem protocolo
        await Message.update(
          { protocolNumber },
          {
            where: {
              ticketId: ticket.id,
              protocolNumber: { [Op.or]: [null, ""] }
            }
          }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao gerenciar protocolo:", error);
    throw new AppError("ERR_PROTOCOL_UPDATE_FAILED", 500);
  }

  await ticket.update(data);

  if (oldStatus === "pending" && statusData === "open") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "open"
    });
  }

  if (statusData === "closed") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "closed"
    });
  }

  if (oldStatus === "open" && statusData === "pending") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "pending"
    });
  }

  if (isTransference) {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "transfered"
    });
    if (userId) {
      await CreateLogTicketService({
        userId,
        ticketId,
        type: "receivedTransfer"
      });
    }
  }

  await ticket.reload();

  if (isTransference) {
    await ticket.setDataValue("isTransference", true);
  }

  if (toPending) {
    socketEmit({
      tenantId,
      type: "notification:new",
      payload: ticket
    });
  }

  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
