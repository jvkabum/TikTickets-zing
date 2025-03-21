// import AppError from "../../errors/AppError";
// import socketEmit from "../../helpers/socketEmit";
import LogTicket from "../../models/LogTicket";
import User from "../../models/User";

type logType =
  | "access"
  | "create"
  | "closed"
  | "transfered"
  | "receivedTransfer"
  | "open"
  | "pending"
  | "queue"
  | "userDefine"
  | "delete"
  | "chatBot"
  | "autoClose"
  | "retriesLimitQueue"
  | "retriesLimitUserDefine";

interface Request {
  type: logType;
  ticketId: number | string;
  userId?: number | string;
  queueId?: number | string;
}

const CreateLogTicketService = async ({
  type,
  userId,
  ticketId,
  queueId
}: Request): Promise<void> => {
  // Verificar se o userId existe no banco antes de criar o log
  let validUserId = userId;
  
  if (userId) {
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      console.log(`Usuário ID ${userId} não encontrado. Definindo como undefined.`);
      validUserId = undefined;
    }
  }
  
  await LogTicket.create({
    userId: validUserId,
    ticketId,
    type,
    queueId
  });

  // socketEmit({
  //   tenantId,
  //   type: "ticket:update",
  //   payload: ticket
  // });
};

export default CreateLogTicketService;
