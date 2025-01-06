import { Request, Response } from "express";
import { number } from "yup";
import { getIO } from "../libs/socket";
import AdminListChatFlowService from "../services/AdminServices/AdminListChatFlowService";
import AdminListSettingsService from "../services/AdminServices/AdminListSettingsService";
import AdminListTenantsService from "../services/AdminServices/AdminListTenantsService";
import AdminListUsersService from "../services/AdminServices/AdminListUsersService";
import AdminListChannelsService from "../services/AdminServices/AdminListChannelsService";
import AdminUpdateUserService from "../services/AdminServices/AdminUpdateUserService";
import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import AppError from "../errors/AppError";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import AdminCreateUserService from "../services/AdminServices/AdminCreateUserService";
import AdminUpdateTenantService from "../services/AdminServices/AdminUpdateTenentService";
import AdminCreateTenantService from "../services/AdminServices/AdminCreateTenantService";
import AdminDeleteTenantService from "../services/AdminServices/AdminDeleteTenantService";

// ====================
// Tipos e Interfaces
// ====================

// Tipos para parâmetros de consulta
// Usados para definir os parâmetros aceitos nas requisições de listagem
type IndexQuery = {
  searchParam: string; // Parâmetro de busca
  pageNumber: string;  // Número da página para paginação
};

type IndexQuerySettings = {
  tenantId?: string | number; // ID opcional do tenant
};

// Interface para dados de canais de comunicação
// Define os dados necessários para criar ou atualizar um canal
interface ChannelData {
  name: string; // Nome do canal
  status?: string; // Status do canal
  isActive?: string; // Indica se o canal está ativo
  tokenTelegram?: string; // Token do Telegram
  instagramUser?: string; // Usuário do Instagram
  instagramKey?: string; // Chave do Instagram
  type: "waba" | "instagram" | "telegram" | "whatsapp"; // Tipo de canal
  wabaBSP?: string; // Provedor de serviços de negócios do WhatsApp
  tokenAPI?: string; // Token da API
  tenantId: string | number; // ID do tenant
}

// ====================
// Controladores de Usuários
// ====================

// Lista usuários com paginação e busca
// Permite buscar e listar usuários com base em parâmetros de pesquisa e paginação
export const indexUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { users, count, hasMore } = await AdminListUsersService({
    searchParam,
    pageNumber
  });
  return res.status(200).json({ users, count, hasMore });
};

// Atualiza dados de um usuário
// Atualiza as informações de um usuário específico e notifica via socket
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData = req.body; // Dados do usuário a serem atualizados
  const { userId } = req.params; // ID do usuário a ser atualizado

  const user = await AdminUpdateUserService({ userData, userId });

  // Notifica via socket sobre a atualização
  const io = getIO();
  if (user) {
    io.emit(`${user.tenantId}:user`, {
      action: "update",
      user
    });
  }

  return res.status(200).json(user);
};

// ====================
// Controladores de Tenants
// ====================

// Lista todos os tenants (empresas/organizações)
// Retorna uma lista de todos os tenants cadastrados
export const indexTenants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenants = await AdminListTenantsService();
  return res.status(200).json(tenants);
};

// Atualiza dados de um tenant
// Atualiza as informações de um tenant específico
export const updateTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body; // Dados do tenant a serem atualizados
  const { tenantId } = req.params; // ID do tenant a ser atualizado

  const tenant = await AdminUpdateTenantService({ tenantData, tenantId });

  return res.status(200).json(tenant);
};

// Cria um novo tenant
// Adiciona um novo tenant ao sistema
export const createTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body; // Dados do novo tenant

  const tenant = await AdminCreateTenantService({ tenantData });

  return res.status(201).json(tenant);
};

// Remove um tenant
// Exclui um tenant específico do sistema
export const deleteTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params; // ID do tenant a ser removido

  await AdminDeleteTenantService({ tenantId });

  return res.status(204).send();
};

// ====================
// Controladores de Fluxos de Chat
// ====================

// Lista fluxos de chat de um tenant
// Retorna os fluxos de chat associados a um tenant específico
export const indexChatFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params; // ID do tenant
  const chatFlow = await AdminListChatFlowService({ tenantId });
  return res.status(200).json(chatFlow);
};

// ====================
// Controladores de Configurações
// ====================

// Lista configurações de um tenant
// Retorna as configurações associadas a um tenant específico
export const indexSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params as IndexQuerySettings; // ID do tenant
  const settings = await AdminListSettingsService(tenantId);

  return res.status(200).json(settings);
};

// Atualiza uma configuração específica
// Atualiza uma configuração de um tenant e notifica via socket
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params; // ID do tenant
  const { value, key } = req.body; // Chave e valor da configuração a ser atualizada

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  // Notifica via socket sobre a atualização
  const io = getIO();
  io.emit(`${tenantId}:settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

// ====================
// Controladores de Canais de Comunicação
// ====================

// Lista canais de comunicação de um tenant
// Retorna os canais de comunicação associados a um tenant específico
export const indexChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.query as any; // ID do tenant
  const channels = await AdminListChannelsService({ tenantId });
  return res.status(200).json(channels);
};

// Cria um novo canal de comunicação
// Adiciona um novo canal de comunicação ao sistema
export const storeChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    name,
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey,
    type,
    wabaBSP,
    tokenAPI
  } = req.body; // Dados do novo canal

  const data: ChannelData = {
    name,
    status: "DISCONNECTED", // Status inicial do canal
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey,
    type,
    wabaBSP,
    tokenAPI
  };

  const channels = await CreateWhatsAppService(data);
  return res.status(200).json(channels);
};

// ====================
// Controladores de Criação de Usuários
// ====================

// Cria um novo usuário
// Adiciona um novo usuário ao sistema e notifica via socket
export const storeUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tenantId, email, password, name, profile } = req.body; // Dados do novo usuário

    const user = await AdminCreateUserService({
      email,
      password,
      name,
      profile,
      tenantId
    });

    // Notifica via socket sobre o novo usuário
    const io = getIO();
    io.emit(`${tenantId}:user`, {
      action: "create",
      user
    });

    return res.status(200).json(user);
  } catch (error) {
    // Trata erro de email já registrado
    if (error instanceof AppError && error.message === "ERR_EMAIL_ALREADY_REGISTERED") {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
};
