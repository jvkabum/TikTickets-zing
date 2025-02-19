import { Message as WbotMessage } from "whatsapp-web.js";
import { CustomMessageTypes } from "../WbotMessagePoll";

const isValidMsg = (msg: WbotMessage & { type: CustomMessageTypes }): boolean => {
  if (msg.from === "status@broadcast") return false;
  
  const validTypes = [
    "chat",
    "audio",
    "ptt",
    "video",
    "image",
    "document",
    "vcard",
    "sticker",
    "location",
    "poll_creation",
    "poll_vote"
  ];

  return validTypes.includes(msg.type as string);
};

export default isValidMsg;
