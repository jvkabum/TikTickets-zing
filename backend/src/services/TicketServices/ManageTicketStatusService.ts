import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

interface Request {
  messageId: string;
  tenantId: number;
}

class ManageTicketStatusService {
  public async execute({ messageId, tenantId }: Request): Promise<Ticket | null> {
    const message = await Message.findOne({
      where: { messageId, tenantId },
      include: [
        {
          model: Ticket,
          as: "ticket",
          where: { tenantId }
        }
      ]
    });

    if (!message) {
      throw new Error("ERR_MESSAGE_NOT_FOUND");
    }

    // Se a mensagem não tem ticket associado, retorna
    if (!message.ticket) {
      return null;
    }

    const ticket = message.ticket;

    // Se não existe ticket, retorna null para criar um novo
    if (!ticket.id) {
      return null;
    }

    // Se a mensagem é minha (fromMe), mantém exatamente o mesmo status
    if (message.fromMe) {
      // Não faz nenhuma atualização, apenas retorna o ticket como está
      return ticket;
    }

    // Para mensagens que não são minhas, mantém o estado atual
    const currentStatus = ticket.status;
    await ticket.update({
      status: currentStatus
    });

    return ticket;
  }
}

export default ManageTicketStatusService; 