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
  const { status, userId, tenantId, queueId } = ticketData;

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

    // Gera um novo número de protocolo
    const protocolNumber = `${format(date, "yyyyMMddHHmmss")}-${ticket.id}`;

    if (oldStatus === "closed" && statusData === "open") {
      // Reabertura do ticket
      await CheckContactOpenTickets(ticket.contact.id);
      
      await Protocol.create({
        protocolNumber,
        contactId: ticket.contactId,
        tenantId: ticket.tenantId,
        ticketId: ticket.id,
        userId: userIdRequest,
        status: "ABER"
      });

      // Atualiza mensagens existentes com o novo protocolo
      await Message.update(
        { protocolNumber },
        {
          where: {
            ticketId: ticket.id,
            createdAt: { [Op.gte]: date }
          }
        }
      );
    } else if (statusData === "closed") {
      data.closedAt = date.getTime();
      
      if (lastProtocol) {
        await Protocol.create({
          protocolNumber: lastProtocol.protocolNumber,
          contactId: ticket.contactId,
          tenantId: ticket.tenantId,
          ticketId: ticket.id,
          userId: userIdRequest,
          status: "FECH"
        });
      }
    } else if (oldStatus === "pending" && statusData === "open" && !lastProtocol) {
      // Primeira abertura do ticket
      data.autoReplyId = null;
      data.stepAutoReplyId = null;
      data.startedAttendanceAt = date.getTime();

      await Protocol.create({
        protocolNumber,
        contactId: ticket.contactId,
        tenantId: ticket.tenantId,
        ticketId: ticket.id,
        userId: userIdRequest,
        status: "ABER"
      });

      // Atualiza mensagens existentes com o novo protocolo
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
