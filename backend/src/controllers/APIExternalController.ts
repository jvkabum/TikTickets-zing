import * as Yup from "yup";
import { Request, Response } from "express";

import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { getWbot } from "../libs/wbot";

// Interface para dados da requisição de mensagem
interface MessageDataRequest {
  apiId: string;
  sessionId: number;
  body: string;
  number: string;
  media?: Express.Multer.File | string;
  externalKey: string;
  tenantId: number;
}

// Envia mensagem através da API externa
export const sendMessageAPI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;
  const media = req.file as Express.Multer.File;

  // Verifica se a configuração da API existe e pertence ao tenant
  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  // Verifica se a sessão tem autorização para usar esta API
  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  // Prepara os dados da nova mensagem
  const newMessage: MessageDataRequest = {
    ...req.body,
    apiId,
    sessionId,
    tenantId,
    apiConfig: APIConfig,
    media
  };

  // Schema de validação dos dados da mensagem
  const schema = Yup.object().shape({
    apiId: Yup.string(),
    sessionId: Yup.number(),
    body: Yup.string().required(),
    number: Yup.string().required(),
    mediaUrl:
      Yup.string().url().nullable() ||
      Yup.object().shape({
        destination: Yup.string().required(),
        encoding: Yup.string().required(),
        fieldname: Yup.string().required(),
        filename: Yup.string().required(),
        mimetype: Yup.string().required(),
        originalname: Yup.string().required(),
        path: Yup.string().required(),
        size: Yup.number().required()
      }),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newMessage);
  } catch (error) {
    throw new AppError(error.message);
  }

  // Adiciona mensagem à fila de envio
  Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};

// Inicia uma sessão do WhatsApp
export const startSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;

  // Verifica se a configuração da API existe e pertence ao tenant
  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  // Verifica se a sessão tem autorização para usar esta API
  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  // Busca informações da conexão WhatsApp
  const whatsapp = await ShowWhatsAppService({
    id: APIConfig.sessionId,
    tenantId: APIConfig.tenantId,
    isInternal: true
  });

  try {
    // Verifica se já existe uma conexão ativa
    const wbot = getWbot(APIConfig.sessionId);
    const isConnectStatus = (await wbot.getState()) === "CONNECTED";
    if (!isConnectStatus) {
      throw new Error("Necessário iniciar sessão");
    }
  } catch (error) {
    // Se não houver conexão ou estiver desconectada, inicia uma nova sessão
    StartWhatsAppSession(whatsapp);
  }

  return res.status(200).json(whatsapp);
};
