/* eslint-disable @typescript-eslint/no-explicit-any */
import SendMessagesSchenduleWbot from "../services/WbotServices/SendMessagesSchenduleWbot";
import { logger } from "../utils/logger";

// Job responsável por processar e enviar mensagens agendadas
// Verifica periodicamente se existem mensagens que devem ser enviadas
export default {
  // Identificador único do job no sistema
  key: "SendMessageSchenduled",

  // Configurações de execução do job
  options: {
    // Mantém o histórico de execuções completas
    removeOnComplete: false,
    // Mantém o registro em caso de falhas para análise
    removeOnFail: false,
    // ID único para identificação do job na fila
    jobId: "SendMessageSchenduled",
    // Configuração de repetição: executa a cada 1 minuto
    repeat: {
      every: 1 * 60 * 1000 // Intervalo de 1 minuto em milissegundos
    }
  },

  // Função principal que processa o envio das mensagens agendadas
  // Busca e envia todas as mensagens que atingiram seu horário programado
  async handle() {
    try {
      logger.info("SendMessageSchenduled Initiated");
      await SendMessagesSchenduleWbot();
      logger.info("Finalized SendMessageSchenduled");
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      throw new Error(error);
    }
  }
};
