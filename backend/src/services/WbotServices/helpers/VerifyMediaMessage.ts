import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import fs from "fs";

import { Message as WbotMessage } from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import ffmpeg from "fluent-ffmpeg";

import Message from "../../../models/Message";
import VerifyQuotedMessage from "./VerifyQuotedMessage";
import CreateMessageService from "../../MessageServices/CreateMessageService";
import { logger } from "../../../utils/logger";

ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

const writeFileAsync = promisify(writeFile);

const VerifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message | void> => {
  const quotedMsg = await VerifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    logger.error(`ERR_WAPP_DOWNLOAD_MEDIA:: ID: ${msg.id.id}`);
    return;
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  } else {
    const originalFilename = media.filename ? `-${media.filename}` : "";
    // Always write a random filename
    media.filename = `${new Date().getTime()}${originalFilename}`;
  }

  const inputFile = `./public/${media.filename}`;
  let outputFile: string;

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    )
      .then(() => {

        if (inputFile.endsWith(".ogg")) {
          outputFile = inputFile.replace(".ogg", ".mp3");
        } else {
          return;
        }

        return new Promise<void>((resolve, reject) => {
          ffmpeg(inputFile)
            .toFormat("mp3")
            .save(outputFile)
            .on("end", () => {
              resolve();
            })
            .on("error", (err: any) => {
              reject(err);
            });
        });
      })
      .then(() => {
        if (outputFile) {
          fs.unlinkSync(inputFile);
          media.filename = outputFile.split('/').pop();
        }
      })
      .catch(err => {
        console.error("Ocorreu um erro:", err);
        // Trate o erro de acordo com sua lógica de aplicativo.
      });
  } catch (err: any) {
    logger.error(err);
  }

  const messageData = {
    messageId: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    timestamp: msg.timestamp,
    status: msg.fromMe ? "sended" : "received"
  };

  await ticket.update({
    lastMessage: msg.body,
    lastMessageAt: new Date().getTime(),
    answered: msg.fromMe || false
  });
  const newMessage = await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });

  return newMessage;
};

export default VerifyMediaMessage;
