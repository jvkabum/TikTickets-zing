import cron from 'node-cron';
import { QueryTypes } from 'sequelize';
import db from '../database'; // Ajuste o caminho conforme necessário
import { getDaysToClose } from '../services/SettingServices/ConfiguraFechamentoTicketService';

const closePendingTickets = async () => {
    try {
        // Obter o número de dias para fechar os Tickets
        const daysToClose = await getDaysToClose();
        
        // Verifica se o valor de daysToClose é válido
        if (daysToClose <= 0) {
            console.error("Configuração inválida de dias para fechamento. O valor de 'daysToClose' deve ser maior que 0.");
            return;
        }
        
        // Calcular a data limite para fechamento dos Tickets
        const cutoffDate = new Date(Date.now() - daysToClose * 24 * 60 * 60 * 1000);

        // Log da data de corte para verificar seu valor
        console.log("Data de corte para fechamento:", cutoffDate.toISOString());

        // Atualiza Tickets que estão Pendentes ou Abertos há mais do que o número de dias especificado
        const [results, metadata] = await db.query(
            `UPDATE public."Tickets"
             SET status = 'closed'
             WHERE (status = 'pending' OR status = 'open')
             AND "updatedAt" < :cutoffDate`,
            {
                replacements: { cutoffDate },
                type: QueryTypes.UPDATE
            }
        );

        // Extrair e verificar o número de linhas afetadas
        const rowsAffected = metadata;

        if (rowsAffected > 0) {
            console.log(`Fechamento automático realizado para ${rowsAffected} ticket(s) pendente(s)/aberto(s) há mais de ${daysToClose} dias.`);
        } else {
            console.log("Nenhum ticket pendente ou aberto foi encontrado para fechamento.");
        }
    } catch (error) {
        console.error("Erro ao fechar Tickets pendentes:", error);
    }
};

// Configura a tarefa agendada para executar diariamente à meia-noite
const scheduleClosePendingTicketsJob = () => {
    // Executa a cada minuto para testes, ajuste conforme necessário
    cron.schedule('* * * * *', closePendingTickets);
};

export default scheduleClosePendingTicketsJob;