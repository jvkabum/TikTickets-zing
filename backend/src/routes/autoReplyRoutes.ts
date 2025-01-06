import express from "express";
import isAuth from "../middleware/isAuth";
import * as AutoReplyController from "../controllers/AutoReplyController";
import * as StepsReplyController from "../controllers/StepsReplyController";
import * as StepsReplyActionController from "../controllers/StepsReplyActionController";

// Cria uma nova instância do roteador do Express
const autoReplyRoutes = express.Router();

// ====================
// Rota para criar uma nova resposta automática (POST)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
autoReplyRoutes.post("/auto-reply", isAuth, AutoReplyController.store);

// ====================
// Rota para listar todas as respostas automáticas (GET)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
autoReplyRoutes.get("/auto-reply", isAuth, AutoReplyController.index);

// ====================
// Rota para atualizar uma resposta automática específica (PUT)
// ====================
// O ID da resposta automática é passado como parâmetro na URL
autoReplyRoutes.put(
  "/auto-reply/:autoReplyId",
  isAuth,
  AutoReplyController.update
);

// ====================
// Rota para remover uma resposta automática específica (DELETE)
// ====================
// O ID da resposta automática é passado como parâmetro na URL
autoReplyRoutes.delete(
  "/auto-reply/:autoReplyId",
  isAuth,
  AutoReplyController.remove
);

// ====================
// Rota para adicionar um passo a uma resposta automática (POST)
// ====================
// O ID da resposta automática é passado como parâmetro na URL
autoReplyRoutes.post(
  "/auto-reply/:idAutoReply/steps",
  isAuth,
  StepsReplyController.store
);

// ====================
// Rota para atualizar um passo de uma resposta automática (PUT)
// ====================
// O ID da resposta automática e o ID do passo são passados como parâmetros na URL
autoReplyRoutes.put(
  "/auto-reply/:idAutoReply/steps/:stepsReplyId",
  isAuth,
  StepsReplyController.update
);

// ====================
// Rota para remover um passo de uma resposta automática (DELETE)
// ====================
// O ID da resposta automática e o ID do passo são passados como parâmetros na URL
autoReplyRoutes.delete(
  "/auto-reply/:idAutoReply/steps/:stepsReplyId",
  isAuth,
  StepsReplyController.remove
);

// ====================
// Rota para criar uma nova ação de resposta (POST)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
autoReplyRoutes.post(
  "/auto-reply-action",
  isAuth,
  StepsReplyActionController.store
);

// ====================
// Rota para atualizar uma ação de resposta específica (PUT)
// ====================
// O ID da ação de resposta é passado como parâmetro na URL
autoReplyRoutes.put(
  "/auto-reply-action/:stepsReplyActionId",
  isAuth,
  StepsReplyActionController.update
);

// ====================
// Rota para remover uma ação de resposta específica (DELETE)
// ====================
// O ID da ação de resposta é passado como parâmetro na URL
autoReplyRoutes.delete(
  "/auto-reply-action/:stepsReplyActionId",
  isAuth,
  StepsReplyActionController.remove
);

// Exporta as rotas de auto-respostas para uso em outras partes da aplicação
export default autoReplyRoutes;
