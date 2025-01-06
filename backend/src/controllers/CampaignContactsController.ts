import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignContactsService from "../services/CampaignContactsServices/CreateCampaignContactsService";
import ListCampaignContactsService from "../services/CampaignContactsServices/ListCampaignContactsService";
import DeleteCampaignContactsService from "../services/CampaignContactsServices/DeleteCampaignContactsService";
import DeleteAllCampaignContactsService from "../services/CampaignContactsServices/DeleteAllCampaignContactsService";

// Adiciona contatos a uma campanha
export const store = async (req: Request, res: Response): Promise<Response> => {
  // Verifica se o usuário é admin
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Lista de contatos a serem adicionados
  const contacts = [...req.body];
  const { campaignId } = req.params;

  // Cria os contatos da campanha
  const cc = await CreateCampaignContactsService({
    campaignContacts: contacts,
    campaignId
  });

  return res.status(200).json(cc);
};

// Lista contatos de uma campanha
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { campaignId } = req.params;
  
  // Busca os contatos da campanha
  const tags = await ListCampaignContactsService({
    campaignId,
    tenantId
  });
  return res.status(200).json(tags);
};

// Código comentado de atualização
// export const update = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { tenantId } = req.user;

//   if (req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }
//   const tagData: TagData = { ...req.body, userId: req.user.id, tenantId };

//   const schema = Yup.object().shape({
//     tag: Yup.string().required(),
//     color: Yup.string().required(),
//     isActive: Yup.boolean().required(),
//     userId: Yup.number().required()
//   });

//   try {
//     await schema.validate(tagData);
//   } catch (error) {
//     throw new AppError(error.message);
//   }

//   const { tagId } = req.params;
//   const tagObj = await UpdateTagService({
//     tagData,
//     tagId
//   });

//   return res.status(200).json(tagObj);
// };

// Remove um contato específico da campanha
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId, contactId } = req.params;

  // Remove o contato da campanha
  await DeleteCampaignContactsService({ campaignId, contactId, tenantId });
  return res.status(200).json({ message: "Campagin Contact deleted" });
};

// Remove todos os contatos de uma campanha
export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  // Remove todos os contatos da campanha
  await DeleteAllCampaignContactsService({ campaignId, tenantId });
  return res.status(200).json({ message: "Campagin Contacts deleted" });
};
