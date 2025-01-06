import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

// Função para obter a conexão padrão do WhatsApp para um tenant específico
// @param tenantId - ID do tenant (empresa/organização)
// @param channelId - ID opcional do canal específico a ser buscado
// @returns Promise<Whatsapp> - Retorna a conexão do WhatsApp encontrada
const GetDefaultWhatsApp = async (
  tenantId: string | number,
  channelId?: number
): Promise<Whatsapp> => {
  // Define os critérios de busca: tenant específico e status conectado
  const where: any = { tenantId, status: "CONNECTED" };

  // Se um channelId foi fornecido, busca por esse canal específico
  if (channelId) {
    where.id = channelId;
  } else {
    // Caso contrário, busca apenas conexões do tipo whatsapp
    where.type = "whatsapp";
  }

  // Busca uma conexão que atenda aos critérios definidos
  const defaultWhatsapp = await Whatsapp.findOne({
    where
  });

  // Se não encontrar uma conexão ou não houver tenant, lança erro
  if (!defaultWhatsapp || !tenantId) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND");
  }

  // Retorna a conexão encontrada
  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
