import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";

// Função para verificar se um contato já possui tickets abertos
// @param contactId - ID do contato a ser verificado
// @throws AppError - Lança erro se encontrar ticket aberto
const CheckContactOpenTickets = async (contactId: number): Promise<void> => {
  // Busca por tickets com status 'open' ou 'pending' para o contato
  const ticket = await Ticket.findOne({
    where: { 
      contactId, 
      status: { 
        [Op.or]: ["open", "pending"] // Verifica ambos os status
      } 
    }
  });

  // Se encontrar algum ticket aberto ou pendente
  if (ticket) {
    // Lança erro com os dados do ticket encontrado
    // Status 409 indica conflito
    // throw new AppError("ERR_OTHER_OPEN_TICKET", );
    throw new AppError(JSON.stringify(ticket), 409);
  }
};

export default CheckContactOpenTickets;
