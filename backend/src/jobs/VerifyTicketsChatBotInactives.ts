/* eslint-disable @typescript-eslint/no-explicit-any */
import FindUpdateTicketsInactiveChatBot from "../services/TicketServices/FindUpdateTicketsInactiveChatBot";
import { logger } from "../utils/logger";

// Job responsável por verificar tickets inativos do chatbot
// Monitora e atualiza o status de conversas automatizadas que não têm atividade
export default {
  // Identificador único do job no sistema
  key: "VerifyTicketsChatBotInactives",

  // Configurações de execução do job
  options: {
    // Mantém o histórico de execuções completas para auditoria
    removeOnComplete: false,
    // Mantém registros de falhas para análise e debug
    removeOnFail: false,
    // ID único para identificação do job na fila
    jobId: "VerifyTicketsChatBotInactives",
    // Configuração de repetição: executa a cada 5 minutos
    repeat: {
      every: 5 * 60 * 1000 // Intervalo em milissegundos
    }
  },

  // Função principal que verifica e atualiza tickets inativos
  // Busca tickets do chatbot sem atividade recente e atualiza seus status
  async handle() {
    try {
      logger.info("FindUpdateTicketsInactiveChatBot Initiated");
      await FindUpdateTicketsInactiveChatBot();
      logger.info("Finalized FindUpdateTicketsInactiveChatBot");
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      throw new Error(error);
    }
  }
};
