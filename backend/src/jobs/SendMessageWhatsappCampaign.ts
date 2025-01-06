/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import CampaignContacts from "../models/CampaignContacts";

// Job responsável por enviar mensagens de campanha via WhatsApp
// Gerencia o envio de mensagens em massa para contatos específicos
export default {
  // Identificador único do job no sistema
  key: "SendMessageWhatsappCampaign",

  // Configurações de execução e retry do job
  options: {
    // Atraso inicial de 15 segundos entre mensagens
    // Evita sobrecarga e bloqueios do WhatsApp
    delay: 15000,
    // Número máximo de tentativas em caso de falha
    attempts: 10,
    // Remove o job da fila após completar com sucesso
    removeOnComplete: true,
    // Configuração de retry em caso de falha
    backoff: {
      type: "fixed",
      delay: 60000 * 5 // Intervalo de 5 minutos entre tentativas
    }
  },

  // Função principal que processa o envio da mensagem de campanha
  // Suporta envio de mensagens com ou sem mídia anexada
  async handle({ data }: any) {
    try {
      /// feito por está apresentando problema com o tipo
      const wbot = getWbot(data.whatsappId);
      let message = {} as WbotMessage;
      if (data.mediaUrl) {
        const customPath = join(__dirname, "..", "..", "public");
        const mediaPath = join(customPath, data.mediaName);
        const newMedia = MessageMedia.fromFilePath(mediaPath);
        message = await wbot.sendMessage(`${data.number}@c.us`, newMedia, {
          sendAudioAsVoice: true,
          caption: data.message
        });
      } else {
        message = await wbot.sendMessage(`${data.number}@c.us`, data.message, {
          linkPreview: false
        });
      }

      await CampaignContacts.update(
        {
          messageId: message.id.id,
          messageRandom: data.messageRandom,
          body: data.message,
          mediaName: data.mediaName,
          timestamp: message.timestamp,
          jobId: data.jobId
        },
        { where: { id: data.campaignContact.id } }
      );

      return message;
    } catch (error) {
      logger.error(`Error enviar message campaign: ${error}`);
      throw new Error(error);
    }
  }
};
