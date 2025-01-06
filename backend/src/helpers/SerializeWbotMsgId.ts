import Message from "../models/Message";
import Ticket from "../models/Ticket";

// Função para criar um ID serializado único para mensagens do WhatsApp
// @param ticket - Ticket associado à mensagem
// @param message - Mensagem que precisa ser serializada
// @returns string - ID serializado no formato padrão do WhatsApp
const SerializeWbotMsgId = (ticket: Ticket, message: Message): string => {
  // Cria um ID serializado combinando:
  // - Se a mensagem é do usuário (fromMe)
  // - Número do contato
  // - Tipo de conversa (g para grupo, c para contato individual)
  // - ID original da mensagem
  const serializedMsgId = `${message.fromMe}_${ticket.contact.number}@${
       ticket.isGroup ? "g" : "c"
    }.us_${message.messageId}`;

  // Retorna o ID serializado
  return serializedMsgId;
};

export default SerializeWbotMsgId;
