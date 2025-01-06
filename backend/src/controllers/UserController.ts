// src/controllers/UserController.ts

import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";
import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import UpdateUserConfigsService from "../services/UserServices/UpdateUserConfigsService";
import Tenant from "../models/Tenant"; 

/**
 * Interface para parâmetros de busca na listagem de usuários
 */
type IndexQuery = {
  searchParam: string;    // Termo para busca de usuários
  pageNumber: string;     // Número da página atual
};

/**
 * Lista usuários do tenant com paginação
 * 
 * Este endpoint permite listar usuários associados a um tenant específico,
 * retornando uma lista filtrada e dados de paginação.
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    tenantId
  });

  return res.json({ users, count, hasMore });
};

/**
 * Obtém o número máximo de usuários permitidos para um tenant
 * Verifica os limites configurados na organização
 * @param tenantId ID do tenant para verificar
 * @returns Número máximo de usuários permitidos
 */
const getTenantMaxUsers = async (tenantId: string): Promise<number> => {
  try {
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new AppError("Tenant not found", 404);
    }
    return tenant.maxUsers;
  } catch (error) {
    throw new AppError("Error fetching maxUsers", 500);
  }
};

/**
 * Cria um novo usuário no sistema
 * Verifica limites de usuários e permissões antes da criação
 * Notifica criação via socket para atualização em tempo real
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { email, password, name, profile } = req.body;
  const { users } = await ListUsersService({ tenantId });
  
  if (users.length >= Number(process.env.USER_LIMIT)) {
    throw new AppError("ERR_USER_LIMIT_USER_CREATION", 400);
  }
 
  const maxUsers = await getTenantMaxUsers(String(tenantId));
  if (users.length >= maxUsers) {
    throw new AppError("ERR_USER_LIMIT_USER_CREATION", 400);
  }

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await CreateUserService({
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
};

/**
 * Exibe detalhes de um usuário específico
 * Retorna informações completas do usuário solicitado
 */
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { tenantId } = req.user;

  const user = await ShowUserService(userId, tenantId);

  return res.status(200).json(user);
};

/**
 * Atualiza dados de um usuário
 * Permite modificar informações do perfil e notifica via socket
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const userData = req.body;
  const { tenantId } = req.user;

  const user = await UpdateUserService({ userData, userId, tenantId });

  const io = getIO();
  io.emit(`${tenantId}:user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

/**
 * Atualiza configurações específicas do usuário
 * Permite modificar preferências e configurações pessoais
 */
export const updateConfigs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const userConfigs = req.body;
  const { tenantId } = req.user;

  await UpdateUserConfigsService({ userConfigs, userId, tenantId });

  return res.status(200).json();
};

/**
 * Remove um usuário do sistema
 * Apenas administradores podem remover usuários
 * Notifica remoção via socket para atualização em tempo real
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { tenantId } = req.user;
  const userIdRequest = req.user.id;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId, tenantId, userIdRequest); // Passando todos os argumentos necessários

  const io = getIO();
  io.emit(`${tenantId}:user`, {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
