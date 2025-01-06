import express from "express";
import isAuth from "../middleware/isAuth";
import * as CampaignContactsController from "../controllers/CampaignContactsController";

// Cria uma nova instância do roteador do Express
const campaignContactsRoutes = express.Router();

// ====================
// Rota para adicionar um contato a uma campanha (POST)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
// O ID da campanha é passado como parâmetro na URL
campaignContactsRoutes.post(
  "/campaigns/contacts/:campaignId",
  isAuth,
  CampaignContactsController.store
);

// ====================
// Rota para listar todos os contatos de uma campanha (GET)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
// O ID da campanha é passado como parâmetro na URL
campaignContactsRoutes.get(
  "/campaigns/contacts/:campaignId",
  isAuth,
  CampaignContactsController.index
);

// ====================
// Rota para remover um contato específico de uma campanha (DELETE)
// ====================
// O ID da campanha e o ID do contato são passados como parâmetros na URL
campaignContactsRoutes.delete(
  "/campaigns/contacts/:campaignId/:contactId",
  isAuth,
  CampaignContactsController.remove
);

// ====================
// Rota para remover todos os contatos de uma campanha (DELETE)
// ====================
// O ID da campanha é passado como parâmetro na URL
campaignContactsRoutes.delete(
  "/campaigns/deleteall/contacts/:campaignId",
  isAuth,
  CampaignContactsController.removeAll
);

// Exporta as rotas de contatos de campanha para uso em outras partes da aplicação
export default campaignContactsRoutes;
