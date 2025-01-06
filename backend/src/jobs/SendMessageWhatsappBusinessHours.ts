/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";

// Job responsável por enviar mensagens de horário comercial
// Envia uma mensagem automática quando um contato tenta interagir fora do horário de atendimento
export default {
  // Identificador único do job no sistema
  key: "SendMessageWhatsappBusinessHours",

  // Configurações de execução e retry do job
  options: {
    // Atraso inicial de 1 minuto antes de processar
    delay: 60000,
    // Número máximo de tentativas em caso de falha
    attempts: 10,
    // Configuração de retry em caso de falha
    backoff: {
      type: "fixed",
      delay: 60000 * 5 // Intervalo de 5 minutos entre tentativas
    }
  },

  // Função principal que processa o envio da mensagem de horário comercial
  // Recebe os dados do ticket e envia a mensagem configurada para o contato
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.ticket.whatsappId);
      const message = await wbot.sendMessage(
        `${data.ticket.contact.number}@c.us`,
        data.tenant.messageBusinessHours,
        {
          linkPreview: false
        }
      );

      const result = {
        message,
        messageBusinessHours: data.tenant.messageBusinessHours,
        ticket: data.ticket
      };

      return result;
    } catch (error) {
      logger.error(`Error enviar message business hours: ${error}`);
      throw new Error(error);
    }
  }
};
