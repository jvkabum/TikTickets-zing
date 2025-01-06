import Ticket from '../../models/Ticket';
import TicketLog from '../../models/TicketLog';

class CloseTicketService {
  async execute(ticketId: string): Promise<Ticket | null> {
    // Verifica se o ticket existe
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    // Verifica se o ticket já está fechado
    if (ticket.status === 'closed') {
      throw new Error('O ticket já está fechado');
    }

    // Aqui você pode implementar a lógica para verificar se o ticket pode ser fechado
    // Por exemplo, verificar se não há interações recentes
    const logs = await TicketLog.findAll({
      where: { ticketId },
      order: [['createdAt', 'DESC']],
      limit: 1,
    });

    const canClose = this.canCloseTicket(logs);

    if (!canClose) {
      throw new Error('Não é possível fechar o ticket, pois existem interações recentes.');
    }

    // Atualiza o status do ticket para fechado
    ticket.status = 'closed';
    await ticket.save();

    // Opcional: Criar um log de fechamento
    await this.createCloseLog(ticketId);

    return ticket;
  }

  private canCloseTicket(logs: TicketLog[]): boolean {
    // Implementar a lógica para determinar se o ticket pode ser fechado
    // Exemplo: se o último log foi criado há mais de 24 horas
    if (logs.length === 0) return true; // Se não houver logs, pode fechar

    const lastLogDate = logs[0].createdAt;
    const now = new Date();
    const diffInHours = (now.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60);

    return diffInHours > 24; // Por exemplo, permite o fechamento se não houver logs nas últimas 24 horas
  }

  private async createCloseLog(ticketId: string): Promise<void> {
    const log = new TicketLog({
      ticketId,
      message: 'Ticket fechado',
      createdAt: new Date(),
    });
    await log.save();
  }
}

export { CloseTicketService };
