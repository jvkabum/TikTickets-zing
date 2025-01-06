import { Client as Session } from "whatsapp-web.js";
import { getWbot } from "../libs/wbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";

// Função para obter a instância do WhatsApp Web associada a um ticket
// @param ticket - Objeto do ticket que precisa da conexão WhatsApp
// @returns Promise<Session> - Retorna a sessão do WhatsApp Web
const GetTicketWbot = async (ticket: Ticket): Promise<Session> => {
  // Se o ticket não tiver um WhatsApp associado
  if (!ticket.whatsappId) {
    // Busca a conexão padrão do WhatsApp para o tenant do ticket
    const defaultWhatsapp = await GetDefaultWhatsApp(ticket.tenantId);

    // Associa a conexão padrão ao ticket
    await ticket.$set("whatsapp", defaultWhatsapp);
  }

  // Obtém a instância do bot WhatsApp usando o ID do WhatsApp associado ao ticket
  const wbot = getWbot(ticket.whatsappId);

  // Retorna a instância do bot
  return wbot;
};

export default GetTicketWbot;
