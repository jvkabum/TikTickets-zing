import { Op } from "sequelize";
import socketEmit from "../../helpers/socketEmit";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

// Serviço responsável por marcar mensagens como lidas no Messenger
// Atualiza o status de leitura e notifica os clientes conectados via socket
const MessengerMarkRead = async (
  messageObj: any,
  tenantId: string | number
): Promise<void> => {
  const messages = await Message.findAll({
    where: {
      tenantId,
      createdAt: {
        [Op.lte]: new Date(messageObj.read.watermark)
      },
      fromMe: true,
      ack: {
        [Op.in]: [1, 2]
      }
    },
    include: [
      {
        model: Ticket,
        where: { tenantId },
        include: [
          {
            model: Contact,
            where: {
              tenantId,
              messengerId: messageObj.sender.id
            }
          }
        ]
      }
    ]
  });

  await Promise.all(
    messages.map(async (message: Message | any) => {
      await message.update({ ack: 3 });
      socketEmit({
        tenantId,
        type: "chat:ack",
        payload: {
          ...message.dataValues,
          mediaUrl: message.mediaUrl, // necessário para enviar error no envio do socket - call size
          id: message.id,
          timestamp: message.timestamp,
          messageId: message.messageId,
          status: "sended",
          ack: 3
        }
      });
    })
  );
};

export default MessengerMarkRead;
