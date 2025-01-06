import { differenceInHours, parseJSON } from "date-fns";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { getTbot } from "../libs/tbot";
// import { getInstaBot } from "../libs/InstaBot";
import GetWbotMessage from "./GetWbotMessage";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

// Função para deletar mensagens do sistema em diferentes canais
// @param id - ID da mensagem no banco de dados
// @param messageId - ID da mensagem na plataforma (WhatsApp, Telegram, etc)
// @param tenantId - ID do tenant (empresa/organização)
const DeleteMessageSystem = async (
  id: string,
  messageId: string,
  tenantId: string | number
): Promise<void> => {
  // Busca a mensagem no banco incluindo informações do ticket e contato
  const message = await Message.findOne({
    where: { id },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"],
        where: { tenantId }
      }
    ]
  });

  // Verifica se a mensagem existe e se passou mais de 2 horas
  if (message) {
    const diffHoursDate = differenceInHours(
      new Date(),
      parseJSON(message?.createdAt)
    );

    // Não permite deletar mensagens com mais de 2 horas
    if (diffHoursDate > 2) {
      console.log("Error: Cannot delete message after 2 hours");
      throw new AppError("Cannot delete message after 2 hours of being sent");
    }
  }

  // Se a mensagem não for encontrada, lança erro
  if (!message) {
    throw new AppError("No message found with this ID.");
  }
  
  // Se for uma mensagem agendada pendente, apenas remove do banco
  if (message.messageId === null && message.status === "pending") {
    await message.destroy();
    console.log("Scheduled message deleted from the database.");
    return;
  }

  const { ticket } = message;

  // Deleta mensagem no WhatsApp
  if (ticket.channel === "whatsapp") {
    const messageToDelete = await GetWbotMessage(ticket, messageId);
    if (!messageToDelete) {
      throw new AppError("ERROR_NOT_FOUND_MESSAGE");
    }
    await messageToDelete.delete(true);
  }

  // Deleta mensagem no Telegram
  if (ticket.channel === "telegram") {
    const telegramBot = await getTbot(ticket.whatsappId);
    await telegramBot.telegram.deleteMessage(
      ticket.contact.telegramId,
      +message.messageId
    );
  }

  // Placeholder para deleção no Instagram
  if (ticket.channel === "instagram") {
    // Instagram deletion logic here
    return;
  }

  // Placeholder para deleção no Messenger
  if (ticket.channel === "messenger") {
    return;
  }

  // Marca a mensagem como deletada no banco
  await message.update({ isDeleted: true });
  console.log("Message marked as deleted");

  // Emite evento via socket para atualizar interface em tempo real
  const io = getIO();
  io.to(`tenant:${tenantId}:${ticket.id}`).emit(
    `tenant:${tenantId}:appMessage`,
    {
      action: "update",
      message,
      ticket,
      contact: ticket.contact
    }
  );
};

export default DeleteMessageSystem;
