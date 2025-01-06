import {
  Contact as WbotContact,
  Message as WbotMessage,
  Client
} from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import { logger } from "../../../utils/logger";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import IsValidMsg from "./IsValidMsg";
import VerifyContact from "./VerifyContact";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";
import verifyBusinessHours from "./VerifyBusinessHours";
import VerifyStepsChatFlowTicket from "../../ChatFlowServices/VerifyStepsChatFlowTicket";
import Queue from "../../../libs/Queue";
import Setting from "../../../models/Setting";

interface Session extends Client {
  id: number;
}

const farewellMessageEqualsBody = (
  farewellMessage: string,
  body: string
): boolean => {
  if (!farewellMessage || farewellMessage.trim().length === 0) return false;
  return farewellMessage === body;
};

const HandleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!IsValidMsg(msg)) {
        return;
      }

      const whatsapp = await ShowWhatsAppService({ id: wbot.id });
      const { tenantId } = whatsapp;
      const chat = await msg.getChat();

      // IGNORAR MENSAGENS DE GRUPO
      const Settingdb = await Setting.findOne({
        where: { key: "ignoreGroupMsg", tenantId }
      });
      if (Settingdb?.value == "enabled") {
        if (
          msg.from === "status@broadcast" ||
          msg.to.endsWith("@g.us") ||
          msg.from.endsWith("@g.us")
        ) {
          return;
        }
      }
      // IGNORAR MENSAGENS DE GRUPO

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        // Verifica se a mensagem é de você e retorna imediatamente
        if (msg.fromMe) {
          return resolve();
        }

        msgContact = await msg.getContact();

        if (chat.isGroup) {
          let msgGroupContact;

          if (msg.fromMe) {
            msgGroupContact = await wbot.getContactById(msg.to);
          } else {
            msgGroupContact = await wbot.getContactById(msg.from);
          }

          groupContact = await VerifyContact(msgGroupContact, tenantId);
        }

        const unreadMessages = msg.fromMe ? 0 : (chat.unreadCount || 1);
        if (
          unreadMessages === 0 &&
          farewellMessageEqualsBody(whatsapp.farewellMessage, msg.body)
        )
          return resolve();

        const contact = await VerifyContact(msgContact, tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages,
          tenantId,
          groupContact,
          msg,
          channel: "whatsapp"
        });

        if (ticket?.isCampaignMessage) {
          return resolve();
        }

        if (ticket?.isFarewellMessage) {
          return resolve();
        }

        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, contact);
        } else {
          await VerifyMessage(msg, ticket, contact);
        }

        await VerifyStepsChatFlowTicket(msg, ticket);

        const apiConfig: any = ticket.apiConfig || {};
        if (
          !msg.fromMe &&
          !ticket.isGroup &&
          !ticket.answered &&
          apiConfig?.externalKey &&
          apiConfig?.urlMessageStatus
        ) {
          // Validação do ID da mensagem
          if (!msg.id || !msg.id.id) {
            logger.error("ID da mensagem inválido:", msg.id);
            return resolve(); // ou lance um erro
          }

          const payload = {
            timestamp: Date.now(),
            msg,
            messageId: msg.id.id, // Certifique-se de que este ID é válido
            ticketId: ticket.id,
            externalKey: apiConfig?.externalKey,
            authToken: apiConfig?.authToken,
            type: "hookMessage"
          };
          Queue.add("WebHooksAPI", {
            url: apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }

        await verifyBusinessHours(msg, ticket);
        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default HandleMessage;
