import { join } from "path";
import axios from "axios";
import { createWriteStream } from "fs";
import contentDiposition from "content-disposition";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";
import Whatsapp from "../../models/Whatsapp";
import { EventMessage, MessengerRawEvent } from "./MessengerTypes";
import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";

// Interface que estende o tipo de mensagem do Messenger
// Adiciona campos necessários para processamento interno
interface IMessage extends EventMessage {
  type: string;
  timestamp: number;
}

// Função responsável por baixar arquivos de mídia do Messenger
// Salva o arquivo localmente e retorna o nome do arquivo salvo
const downloadFile = async (url: string, filename: string): Promise<string> => {
  // Faz a requisição para baixar o arquivo
  // Usa stream para lidar com arquivos grandes
  const request = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  const parseDisposition: any = request.headers["content-disposition"]
    ? contentDiposition.parse(request.headers["content-disposition"] || "")
    : { parameters: {} };
  let name = "";

  const filenameExists: any = parseDisposition?.parameters?.filename;
  if (filenameExists) {
    const fileName: any = parseDisposition.parameters.filename;
    name = `${new Date().getTime()}-${fileName}`;
  } else {
    const contentType = request.headers["content-type"];
    const ext = contentType.split("/")[1];
    name = `${filename}-${new Date().getTime()}.${ext}`;
  }

  const pathFile = join(__dirname, "..", "..", "..", "public", name);

  await new Promise((resolve, reject) => {
    request.data
      .pipe(createWriteStream(pathFile))
      .on("finish", async () => resolve(name))
      .on("error", (error: any) => {
        console.error("ERROR DONWLOAD", error);
        // fs.rmdirSync(mediaDir, { recursive: true });
        reject(new Error(error));
      });
  });

  return name;
};

// Serviço principal para processar mensagens com mídia do Messenger
// Baixa os arquivos, cria mensagens no sistema e atualiza o ticket
const MessengerVerifyMediaMessage = async (
  channel: Whatsapp,
  msg: MessengerRawEvent | any,
  ticket: Ticket,
  contact: Contact
): Promise<Message | void> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  let filename;

  await Promise.all(
    msg.message.attachments.map(async (item: any, idx: any) => {
      const name = `${ticket.id}_${msg.message_id}`;
      filename = await downloadFile(item.payload.url, name);
      let quotedMsgId;

      if (msg?.message?.reply_to?.mid) {
        const messageQuoted = await getQuotedForMessageId(
          msg.message.reply_to.mid,
          ticket.tenantId
        );
        quotedMsgId = messageQuoted?.id || undefined;
      }

      const messageData = {
        // idx necessário em função do id ser o mesmo para todos os anexos
        messageId: idx > 0 ? `${msg.message_id}__${idx}` : msg.message_id || "",
        ticketId: ticket.id,
        contactId: contact.id,
        body: msg.message?.text || "",
        fromMe: msg.fromMe,
        read: false,
        mediaUrl: filename,
        mediaType: msg.type,
        quotedMsgId,
        timestamp: +msg.timestamp,
        status: "received"
      };

      await ticket.update({
        lastMessage: msg.message?.text || filename || "",
        lastMessageAt: new Date().getTime(),
        answered: false
      });

      await CreateMessageService({
        messageData,
        tenantId: ticket.tenantId
      });
      // return newMessage;
    })
  );
};

export default MessengerVerifyMediaMessage;
