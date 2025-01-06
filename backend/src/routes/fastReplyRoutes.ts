import express from "express";
import isAuth from "../middleware/isAuth";
import * as FastReplyController from "../controllers/FastReplyController";

const fastReplyRoutes = express.Router();

// Rota para criar uma nova mensagem rápida
fastReplyRoutes.post("/fastreply", isAuth, FastReplyController.store);

fastReplyRoutes.post(
  "/fastreply/delete-images",
  isAuth,
  FastReplyController.deleteImage
);

// Rota para listar todas as mensagens rápidas
fastReplyRoutes.get("/fastreply", isAuth, FastReplyController.index);

// Rota para atualizar uma mensagem rápida específica
fastReplyRoutes.put(
  "/fastreply/:fastReplyId",
  isAuth,
  FastReplyController.update
);

// Rota para deletar uma imagem específica
fastReplyRoutes.post(
  "/fastreply/delete-images",
  isAuth,
  FastReplyController.deleteImage
);

// Rota para deletar uma mensagem rápida específica
fastReplyRoutes.delete(
  "/fastreply/:fastReplyId",
  isAuth,
  FastReplyController.remove
);

export default fastReplyRoutes;
