import express from "express";
import isAuth from "../middleware/isAuth";
import * as APIConfigController from "../controllers/APIConfigController";

// Cria uma nova instância do roteador do Express
const apiConfigRoutes = express.Router();

// ====================
// Rota para criar uma nova configuração de API (POST)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
apiConfigRoutes.post("/api-config", isAuth, APIConfigController.store);

// ====================
// Rota para listar todas as configurações de API (GET)
// ====================
// Usa o middleware isAuth para garantir que o usuário está autenticado
apiConfigRoutes.get("/api-config", isAuth, APIConfigController.index);

// ====================
// Rota para atualizar uma configuração de API específica (PUT)
// ====================
// O ID da API é passado como parâmetro na URL
apiConfigRoutes.put("/api-config/:apiId", isAuth, APIConfigController.update);

// ====================
// Rota para remover uma configuração de API específica (DELETE)
// ====================
// O ID da API é passado como parâmetro na URL
apiConfigRoutes.delete(
  "/api-config/:apiId",
  isAuth,
  APIConfigController.remove
);

// ====================
// Rota para renovar o token de uma configuração de API (PUT)
// ====================
// O ID da API é passado como parâmetro na URL
apiConfigRoutes.put(
  "/api-config/renew-token/:apiId",
  isAuth,
  APIConfigController.renewTokenApi
);

// Exporta as rotas de configuração da API para uso em outras partes da aplicação
export default apiConfigRoutes;
