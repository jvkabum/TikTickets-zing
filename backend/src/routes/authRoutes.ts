import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";

// Cria uma nova instância do roteador do Express
const authRoutes = Router();

// ====================
// Rota para registro de usuário (POST)
// ====================
// Chama o método store do UserController para criar um novo usuário
authRoutes.post("/signup", UserController.store);

// ====================
// Rota para login de usuário (POST)
// ====================
// Chama o método store do SessionController para autenticar o usuário
authRoutes.post("/login", SessionController.store);

// ====================
// Rota para logout de usuário (POST)
// ====================
// Chama o método logout do SessionController para encerrar a sessão do usuário
authRoutes.post("/logout", SessionController.logout);

// ====================
// Rota para atualizar o token de autenticação (POST)
// ====================
// Chama o método update do SessionController para renovar o token
authRoutes.post("/refresh_token", SessionController.update);

// Exporta as rotas de autenticação para uso em outras partes da aplicação
export default authRoutes;
