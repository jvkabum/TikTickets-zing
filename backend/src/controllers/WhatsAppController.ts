import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import AppError from "../errors/AppError";
import Tenant from "../models/Tenant"; 

import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";

/**
 * Lista todas as conexões WhatsApp do tenant
 * Retorna as instâncias do WhatsApp associadas ao tenant atual
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;

  const whatsapps = await ListWhatsAppsService(tenantId);

  return res.status(200).json(whatsapps);
};

/**
 * Exibe detalhes de uma conexão WhatsApp específica
 * Retorna informações detalhadas de uma instância do WhatsApp
 */
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  const whatsapp = await ShowWhatsAppService({ id: whatsappId, tenantId });

  return res.status(200).json(whatsapp);
};

/**
 * Obtém o número máximo de conexões permitidas para um tenant
 * Verifica os limites de conexão configurados para o tenant
 * @param tenantId ID do tenant para verificar
 * @returns Número máximo de conexões permitidas
 */
const getTenantmaxConnections = async (tenantId: string): Promise<number> => {
  try {
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new AppError("Tenant not found", 404);
    }
    return tenant.maxConnections;
  } catch (error) {
    throw new AppError("Error fetching maxTenants", 500);
  }
};

/**
 * Cria uma nova conexão WhatsApp
 * Verifica limites de conexão antes de criar uma nova instância
 * Valida tanto o limite global quanto o limite específico do tenant
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { tenantId } = req.user;
  const whatsapps = await ListWhatsAppsService(tenantId);
  if (whatsapps.length >= Number(process.env.CONNECTIONS_LIMIT)) {
    throw new AppError("ERR_NO_PERMISSION_CONNECTIONS_LIMIT", 400);
  }
  
  const maxConnections = await getTenantmaxConnections(String(tenantId));
  if (whatsapps.length >= maxConnections) {
    throw new AppError("ERR_NO_PERMISSION_CONNECTIONS_LIMIT", 400);
  }

  const { whatsapp } = await CreateWhatsAppService({
    ...whatsappData,
    whatsappId,
    tenantId
  });

  return res.status(200).json(whatsapp);
};

/**
 * Atualiza uma conexão WhatsApp existente
 * Permite modificar configurações e dados de uma instância
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { tenantId } = req.user;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    tenantId
  });

  return res.status(200).json(whatsapp);
};

/**
 * Remove uma conexão WhatsApp
 * Desconecta a instância, remove do banco de dados e notifica via socket
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  await DeleteWhatsAppService(whatsappId, tenantId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit(`${tenantId}:whatsapp`, {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};
