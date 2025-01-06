/* eslint-disable @typescript-eslint/no-explicit-any */
import FindUpdateTicketsInactiveChatBot from "../services/TicketServices/FindUpdateTicketsInactiveChatBot";
import { logger } from "../utils/logger";

// Job responsável por verificar e atualizar tickets inativos do chatbot
// Este job é executado periodicamente para manter o sistema atualizado
export default {
  // Identificador único do job no sistema
  key: "VerifyTicketsChatBotInactives",

  // Configurações de execução do job
  options: {
    // Remove o job da fila após completar com sucesso
    removeOnComplete: true,
    // Mantém o job na fila em caso de falha para análise
    removeOnFail: false,
    // ID único para identificação do job na fila
    jobId: "VerifyTicketsChatBotInactives",
    // Configuração de repetição: executa a cada 5 minutos
    repeat: {
      every: 5 * 60 * 1000 // 5 minutos em milissegundos
    }
  },

  // Função principal que executa a verificação dos tickets
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
