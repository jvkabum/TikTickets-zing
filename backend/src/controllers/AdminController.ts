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

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexQuerySettings = {
  tenantId?: string | number;
};

interface ChannelData {
  name: string;
  status?: string;
  isActive?: string;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
  type: "waba" | "instagram" | "telegram" | "whatsapp";
  wabaBSP?: string;
  tokenAPI?: string;
  tenantId: string | number;
}

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

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData = req.body;
  const { userId } = req.params;

  const user = await AdminUpdateUserService({ userData, userId });

  const io = getIO();
  if (user) {
    io.emit(`${user.tenantId}:user`, {
      action: "update",
      user
    });
  }

  return res.status(200).json(user);
};

export const indexTenants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenants = await AdminListTenantsService();
  return res.status(200).json(tenants);
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body;
  const { tenantId } = req.params;

  const tenant = await AdminUpdateTenantService({ tenantData, tenantId });

  return res.status(200).json(tenant);
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body;

  const tenant = await AdminCreateTenantService({ tenantData });

  return res.status(201).json(tenant);
};

export const deleteTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;

  await AdminDeleteTenantService({ tenantId });

  return res.status(204).send();
};

export const indexChatFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const chatFlow = await AdminListChatFlowService({ tenantId });
  return res.status(200).json(chatFlow);
};

export const indexSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params as IndexQuerySettings;
  const settings = await AdminListSettingsService(tenantId);

  return res.status(200).json(settings);
};

export const updateSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const { value, key } = req.body;

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  const io = getIO();
  io.emit(`${tenantId}:settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

export const indexChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.query as any;
  const channels = await AdminListChannelsService({ tenantId });
  return res.status(200).json(channels);
};

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
  } = req.body;

  const data: ChannelData = {
    name,
    status: "DISCONNECTED",
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

export const storeUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tenantId, email, password, name, profile } = req.body;

    const user = await AdminCreateUserService({
      email,
      password,
      name,
      profile,
      tenantId
    });

    const io = getIO();
    io.emit(`${tenantId}:user`, {
      action: "create",
      user
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError && error.message === "ERR_EMAIL_ALREADY_REGISTERED") {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
};

