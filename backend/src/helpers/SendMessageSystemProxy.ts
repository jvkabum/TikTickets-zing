import { getInstaBot } from "../libs/InstaBot";
import { getTbot } from "../libs/tbot";
import InstagramSendMessagesSystem from "../services/InstagramBotServices/InstagramSendMessagesSystem";
import TelegramSendMessagesSystem from "../services/TbotServices/TelegramSendMessagesSystem";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import { SendWhatsAppMessage } from "../services/WbotServices/SendWhatsAppMessage";

// Interface para os dados necessários para envio de mensagem
type Payload = {
  ticket: any;       // Ticket relacionado à mensagem
  messageData: any;  // Dados da mensagem
  media: any;        // Arquivo de mídia (se houver)
  userId: any;       // ID do usuário que está enviando
};

// Função Proxy para enviar mensagens em diferentes canais
// Implementa o padrão Proxy para abstrair a complexidade de envio em diferentes plataformas
const SendMessageSystemProxy = async ({
  ticket,
  messageData,
  media,
  userId
}: Payload): Promise<any> => {
  let message;

  // Se a mensagem contém mídia (imagem, áudio, vídeo, etc)
  if (messageData.mediaName) {
    switch (ticket.channel) {
      // Envia mídia no Instagram
      case "instagram":
        message = await InstagramSendMessagesSystem(
          getInstaBot(ticket.whatsappId),
          ticket,
          { ...messageData, media }
        );
        break;

      // Envia mídia no Telegram
      case "telegram":
        message = await TelegramSendMessagesSystem(
          getTbot(ticket.whatsappId),
          ticket,
          { ...messageData, media }
        );
        break;

      // Por padrão, envia mídia no WhatsApp
      default:
        message = await SendWhatsAppMedia({ media, ticket, userId });
        break;
    }
  }

  // Se a mensagem não contém mídia (apenas texto)
  if (!media) {
    switch (ticket.channel) {
      // Envia texto no Instagram
      case "instagram":
        message = await InstagramSendMessagesSystem(
          getInstaBot(ticket.whatsappId),
          ticket,
          messageData
        );
        break;

      // Envia texto no Telegram
      case "telegram":
        message = await TelegramSendMessagesSystem(
          getTbot(ticket.whatsappId),
          ticket,
          messageData
        );
        break;

      // Por padrão, envia texto no WhatsApp
      default:
        message = await SendWhatsAppMessage({
          body: messageData.body,
          ticket,
          quotedMsg: messageData?.quotedMsg
        });
        break;
    }
  }

  // Retorna a mensagem enviada
  return message;
};

export default SendMessageSystemProxy;
