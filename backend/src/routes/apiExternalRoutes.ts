import express from "express";
import multer from "multer";
import isAPIAuth from "../middleware/isAPIAuth";
import uploadConfig from "../config/upload";
import * as APIExternalController from "../controllers/APIExternalController";

// Cria uma nova instância do roteador do Express
const apiExternalRoute = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  ...uploadConfig,
  limits: {
    files: 1, // Permite apenas 1 arquivo por requisição
    fileSize: 1024 * 1024 * 5 // 5 MB (tamanho máximo do arquivo)
  }
});

// ====================
// Rota para enviar uma mensagem através da API externa (POST)
// ====================
// Usa o middleware isAPIAuth para garantir que a autenticação da API é válida
// O arquivo de mídia é enviado como parte da requisição
apiExternalRoute.post(
  "/v1/api/external/:apiId",
  isAPIAuth,
  upload.single("media"),
  APIExternalController.sendMessageAPI
);

// ====================
// Rota para iniciar uma sessão com a API externa (POST)
// ====================
// Usa o middleware isAPIAuth para garantir que a autenticação da API é válida
apiExternalRoute.post(
  "/v1/api/external/:apiId/start-session",
  isAPIAuth,
  APIExternalController.startSession
);

// Exporta as rotas externas da API para uso em outras partes da aplicação
export default apiExternalRoute;
