import Ticket from '../../models/Ticket';
import { getDaysToClose } from './ConfiguraFechamentoTicketService';
import { Op } from 'sequelize';
import { subDays } from 'date-fns';

export class ClosePendingTicketsService {
  async execute() {
    try {
      const daysToClose = await getDaysToClose();
      
      // Use date-fns para calcular a data limite de forma mais segura
      const dataLimite = subDays(new Date(), daysToClose);

      const ticketsPendentes = await Ticket.findAll({
        where: {
          status: {
            [Op.in]: ['pending', 'open'], // Inclui tickets com status 'pending' e 'open'
          },
          // Verifique se last_interaction existe e é uma data válida
          ...(dataLimite && { 
            last_interaction: { 
              [Op.lte]: dataLimite 
            } 
          })
        }
      });

      for (const ticket of ticketsPendentes) {
        try {
          ticket.status = 'closed';
          await ticket.save();
          console.log(`Ticket ${ticket.id} fechado automaticamente.`);
        } catch (ticketError) {
          console.error(`Erro ao fechar ticket ${ticket.id}:`, ticketError);
        }
      }
    } catch (error) {
      console.error("Erro ao executar o serviço de fechamento de tickets:", error);
    }
  }
}
