/* eslint-disable @typescript-eslint/no-explicit-any */
// import { v4 as uuid } from "uuid";
import { getWbot } from "../libs/wbot";
import SendMessagesSystemWbot from "../services/WbotServices/SendMessagesSystemWbot";
import { logger } from "../utils/logger";

// Objeto para controlar o estado de envio por tenant
// Evita que múltiplos envios ocorram simultaneamente para o mesmo tenant
const sending: any = {};

// Job responsável pelo envio de mensagens do sistema
// Gerencia o envio de mensagens para cada tenant de forma organizada
export default {
  // Identificador único do job no sistema
  key: "SendMessages",

  // Configurações de execução do job
  options: {
    // Sem limite de tentativas
    attempts: 0,
    // Remove o job da fila após completar com sucesso
    removeOnComplete: true,
    // Remove o job da fila mesmo em caso de falha
    removeOnFail: true
    // Configuração de repetição comentada
    // repeat: {
    //   every: 5000
    // }
  },

  // Função principal que processa o envio das mensagens
  // Garante que apenas um processo de envio ocorra por tenant
  async handle({ data }: any) {
    try {
      logger.info(`Sending Tenant Initiated: ${data.tenantId}`);
      if (sending[data.tenantId]) return;
      const wbot = getWbot(data.sessionId);
      sending[data.tenantId] = true;
      await SendMessagesSystemWbot(wbot, data.tenantId);
      sending[data.tenantId] = false;
      logger.info(`Finalized Sending Tenant: ${data.tenantId}`);
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      sending[data.tenantId] = false;
      throw new Error(error);
    }
  }
};
