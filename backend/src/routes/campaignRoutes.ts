import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as CampaignController from "../controllers/CampaignController";

// Cria uma nova instância do roteador do Express
const campaignsRoutes = express.Router();
const upload = multer(uploadConfig);

// ====================
// Rota para criar uma nova campanha (POST)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
// Permite o upload de múltiplas mídias associadas à campanha
campaignsRoutes.post(
  "/campaigns",
  isAuth,
  upload.array("medias"),
  CampaignController.store
);

// ====================
// Rota para listar todas as campanhas (GET)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
campaignsRoutes.get("/campaigns", isAuth, CampaignController.index);

// ====================
// Rota para atualizar uma campanha específica (PUT)
// ====================
// O ID da campanha é passado como parâmetro na URL
// Permite o upload de múltiplas mídias associadas à campanha
campaignsRoutes.put(
  "/campaigns/:campaignId",
  isAuth,
  upload.array("medias"),
  CampaignController.update
);

// ====================
// Rota para remover uma campanha específica (DELETE)
// ====================
// O ID da campanha é passado como parâmetro na URL
campaignsRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.remove
);

// ====================
// Rota para iniciar uma campanha específica (POST)
// ====================
// O ID da campanha é passado como parâmetro na URL
campaignsRoutes.post(
  "/campaigns/start/:campaignId",
  isAuth,
  CampaignController.startCampaign
);

// ====================
// Rota para cancelar uma campanha específica (POST)
// ====================
// O ID da campanha é passado como parâmetro na URL
campaignsRoutes.post(
  "/campaigns/cancel/:campaignId",
  isAuth,
  CampaignController.cancelCampaign
);

// Exporta as rotas de campanhas para uso em outras partes da aplicação
export default campaignsRoutes;
