import * as Yup from "yup";
import { Request, Response } from "express";

import CreateApiConfigService from "../services/ApiConfigServices/CreateApiConfigService";
import ListApiConfigService from "../services/ApiConfigServices/ListApiConfigService";
import AppError from "../errors/AppError";
import UpdateApiConfigService from "../services/ApiConfigServices/UpdateApiConfigService";
import DeleteApiConfigService from "../services/ApiConfigServices/DeleteApiConfigService";
import RenewApiConfigTokenService from "../services/ApiConfigServices/RenewApiConfigTokenService";

// Interface que define a estrutura dos dados da API
interface ApiData {
  name: string; // Nome da configuração da API
  sessionId: string | number; // ID da sessão
  urlServiceStatus?: string; // URL para status do serviço (opcional)
  urlMessageStatus?: string; // URL para status da mensagem (opcional)
  userId: string | number; // ID do usuário associado
  tenantId: string | number; // ID do inquilino
  authToken?: string; // Token de autenticação (opcional)
  isActive?: boolean; // Indica se a configuração está ativa (opcional)
}

// Interface que define a estrutura dos dados para renovação de token
interface RenewData {
  sessionId: string | number; // ID da sessão
  userId: string | number; // ID do usuário associado
  tenantId: string | number; // ID do inquilino
}

// Função para armazenar uma nova configuração de API
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, id } = req.user; // Obtém o ID do inquilino e do usuário da requisição
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for um administrador
  }

  const newApi: ApiData = { ...req.body, userId: id, tenantId }; // Cria um novo objeto de configuração da API

  // Define o esquema de validação para a nova configuração da API
  const schema = Yup.object().shape({
    name: Yup.string().required(), // Nome é obrigatório
    sessionId: Yup.number().required(), // ID da sessão é obrigatório
    urlServiceStatus: Yup.string().url().nullable(), // URL do status do serviço (opcional)
    urlMessageStatus: Yup.string().url().nullable(), // URL do status da mensagem (opcional)
    userId: Yup.number().required(), // ID do usuário é obrigatório
    tenantId: Yup.number().required() // ID do inquilino é obrigatório
  });

  try {
    await schema.validate(newApi); // Valida os dados da nova configuração
  } catch (error) {
    throw new AppError(error.message); // Lança erro se a validação falhar
  }

  const api = await CreateApiConfigService(newApi); // Cria a nova configuração da API

  return res.status(200).json(api); // Retorna a configuração criada com status 200
};

// Função para listar as configurações de API
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user; // Obtém o ID do inquilino da requisição
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for um administrador
  }
  const apis = await ListApiConfigService({ tenantId }); // Lista as configurações de API para o inquilino
  return res.status(200).json(apis); // Retorna as configurações com status 200
};

// Função para atualizar uma configuração de API
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for um administrador
  }
  const { tenantId, id } = req.user; // Obtém o ID do inquilino e do usuário da requisição
  const { apiId } = req.params; // Obtém o ID da configuração da API a ser atualizada

  const apiData: ApiData = { ...req.body, userId: id, tenantId }; // Cria um novo objeto de configuração da API

  // Define o esquema de validação para a atualização da configuração da API
  const schema = Yup.object().shape({
    name: Yup.string().required(), // Nome é obrigatório
    sessionId: Yup.number().required(), // ID da sessão é obrigatório
    urlServiceStatus: Yup.string().url().nullable(), // URL do status do serviço (opcional)
    urlMessageStatus: Yup.string().url().nullable(), // URL do status da mensagem (opcional)
    userId: Yup.number().required(), // ID do usuário é obrigatório
    tenantId: Yup.number().required(), // ID do inquilino é obrigatório
    isActive: Yup.boolean().required() // Indica se a configuração está ativa
  });

  try {
    await schema.validate(apiData); // Valida os dados da configuração
  } catch (error) {
    throw new AppError(error.message); // Lança erro se a validação falhar
  }

  const api = await UpdateApiConfigService({
    apiData,
    apiId,
    tenantId
  }); // Atualiza a configuração da API

  return res.status(200).json(api); // Retorna a configuração atualizada com status 200
};

// Função para remover uma configuração de API
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for um administrador
  }
  const { tenantId } = req.user; // Obtém o ID do inquilino da requisição
  const { apiId } = req.params; // Obtém o ID da configuração da API a ser removida

  await DeleteApiConfigService({ apiId, tenantId }); // Remove a configuração da API
  return res.status(200).json({ message: "API Config Deleted" }); // Retorna mensagem de sucesso com status 200
};

// Função para renovar o token da configuração da API
export const renewTokenApi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for um administrador
  }

  const { tenantId, id } = req.user; // Obtém o ID do inquilino e do usuário da requisição
  const { apiId } = req.params; // Obtém o ID da configuração da API

  const api: RenewData = { ...req.body, userId: id, tenantId }; // Cria um novo objeto de dados para renovação

  // Define o esquema de validação para a renovação do token
  const schema = Yup.object().shape({
    sessionId: Yup.number().required(), // ID da sessão é obrigatório
    userId: Yup.number().required(), // ID do usuário é obrigatório
    tenantId: Yup.number().required() // ID do inquilino é obrigatório
  });

  try {
    await schema.validate(api); // Valida os dados da renovação
  } catch (error) {
    throw new AppError(error.message); // Lança erro se a validação falhar
  }

  const newApi = await RenewApiConfigTokenService({
    apiId,
    userId: api.userId,
    sessionId: api.sessionId,
    tenantId: api.tenantId
  }); // Renova o token da configuração da API

  return res.status(200).json(newApi); // Retorna a nova configuração com status 200
};
