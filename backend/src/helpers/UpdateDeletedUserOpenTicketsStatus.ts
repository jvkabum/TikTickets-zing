// import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

// Função para atualizar o status de tickets abertos quando um usuário é deletado
// @param tickets - Array de tickets que precisam ser atualizados
// @param tenantId - ID do tenant (empresa/organização)
// @param userIdRequest - ID do usuário que fez a requisição
const UpdateDeletedUserOpenTicketsStatus = async (
  tickets: Ticket[],
  tenantId: string | number,
  userIdRequest: string | number
): Promise<void> => {
  // Itera sobre cada ticket para atualizá-los
  tickets.forEach(async t => {
    const ticketId = t.id.toString();

    // Atualiza o status do ticket para 'pending' (pendente)
    // Isso acontece quando o usuário responsável é deletado
    await UpdateTicketService({
      ticketData: { status: "pending", tenantId },
      ticketId,
      userIdRequest
    });

    // Código comentado para emissão de eventos via socket
    // Pode ser implementado futuramente para notificações em tempo real
    // const io = getIO();
    // if (ticket.status !== oldStatus) {
    //   io.to(`${tenantId}-${oldStatus}`).emit(`${tenantId}-ticket`, {
    //     action: "delete",
    //     ticketId: ticket.id
    //   });
    // }

    // io.to(`${tenantId}-${ticket.status}`)
    //   .to(`${tenantId}-${ticketId}`)
    //   .emit(`${tenantId}-ticket`, {
    //     action: "updateStatus",
    //     ticket
    //   });
  });
};

export default UpdateDeletedUserOpenTicketsStatus;
