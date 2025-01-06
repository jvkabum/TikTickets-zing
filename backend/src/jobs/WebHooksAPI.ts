/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { logger } from "../utils/logger";

// ====================
// Definição das Interfaces
// ====================

// Interface que define a estrutura dos dados do webhook
interface Data {
  url: string; // URL para onde o webhook será enviado
  type: string; // Tipo de webhook
  payload: any; // Dados que serão enviados no payload
}

// Interface que define a estrutura do payload do manipulador
interface HandlerPayload {
  data: Data; // Dados do webhook
}

// Job responsável por processar e enviar webhooks para integrações externas
// Gerencia diferentes tipos de notificações: status de mensagens, mensagens recebidas e status de sessão
export default {
  // Identificador único do job no sistema
  key: "WebHooksAPI",

  // Configurações de execução e retry do job
  options: {
    // Atraso inicial de 6 segundos antes de processar
    delay: 6000,
    // Número máximo de tentativas em caso de falha
    attempts: 50,
    // Configuração de retry em caso de falha
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // Intervalo de 3 minutos entre tentativas
    }
  },

  // Função principal que processa e envia os webhooks
  // Formata o payload de acordo com o tipo de webhook e envia para a URL configurada
  async handle({ data }: HandlerPayload) {
    try {
      let payload = {}; // Inicializa o payload

      // Retorna se não houver URL informada
      if (!data?.url) {
        return { message: "url configurar no webhook não existe." }; // Mensagem de erro se a URL não estiver configurada
      }

      // Formata o payload de acordo com o tipo de webhook
      if (data.type === "hookMessageStatus") {
        payload = {
          ack: data.payload.ack,
          messageId: data.payload.messageId,
          externalKey: data.payload.externalKey,
          type: data.type
        };
      }

      if (data.type === "hookMessage") {
        payload = {
          timestamp: data.payload.timestamp,
          message: data.payload.msg,
          messageId: data.payload.messageId,
          ticketId: data.payload.ticketId,
          externalKey: data.payload.externalKey,
          type: data.type
        };
      }

      if (data.type === "hookSessionStatus") {
        payload = {
          name: data.payload.name,
          number: data.payload.number,
          status: data.payload.status,
          qrcode: data.payload.qrcode,
          timestamp: data.payload.timestamp,
          type: data.type
        };
      }

      // Envia o webhook para a URL configurada
      if (data.payload.authToken) {
        await axios.post(data.url, payload, {
          headers: { authorization: data.payload.authToken } // Inclui o token de autorização se disponível
        });
      } else {
        await axios.post(data.url, payload); // Envia o payload sem token de autorização
      }

      // Registra informações de sucesso no logger
      logger.info(
        `Queue WebHooksAPI success: Data: ${data} Payload: ${payload}`
      );
      return {
        data,
        payload // Retorna os dados e o payload
      };
    } catch (error) {
      logger.error(`Error send message api: ${error}`); // Registra erro no logger
      if (error?.response?.status === 404) {
        return { message: "url configurar no webhook não existe." }; // Mensagem de erro se a URL não existir
      }
      throw new Error(error); // Lança erro se ocorrer um problema
    }
  }
};
