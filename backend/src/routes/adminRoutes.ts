import express from "express";
import * as AdminController from "../controllers/AdminController";
import isAuthAdmin from "../middleware/isAuthAdmin";

// Cria uma nova instância do roteador do Express
const adminRoutes = express.Router();

// ====================
// Rota para listar todos os usuários (GET)
// ====================
// Usa o middleware isAuthAdmin para garantir que o usuário é um administrador
adminRoutes.get("/admin/users", isAuthAdmin, AdminController.indexUsers);

// ====================
// Rota para atualizar um usuário específico (PUT)
// ====================
// O ID do usuário é passado como parâmetro na URL
adminRoutes.put(
  "/admin/users/:userId",
  isAuthAdmin,
  AdminController.updateUser  
);

// ====================
// Rota para listar todos os inquilinos (GET)
// ====================
adminRoutes.get("/admin/tenants", isAuthAdmin, AdminController.indexTenants);

// ====================
// Rota para atualizar um inquilino específico (PUT)
// ====================
// O ID do inquilino é passado como parâmetro na URL
adminRoutes.put(
  "/admin/tenantsUpdate/:tenantId",
  isAuthAdmin,
  AdminController.updateTenant
);

// ====================
// Rota para criar um novo inquilino (POST)
// ====================
adminRoutes.post(
  "/admin/tenants",
  isAuthAdmin,
  AdminController.createTenant
);

// ====================
// Rota para deletar um inquilino específico (DELETE)
// ====================
// O ID do inquilino é passado como parâmetro na URL
adminRoutes.delete(
  "/admin/tenants/:tenantId",
  isAuthAdmin,
  AdminController.deleteTenant
);

// ====================
// Rota para listar o fluxo de chat de um inquilino específico (GET)
// ====================
// O ID do inquilino é passado como parâmetro na URL
adminRoutes.get(
  "/admin/chatflow/:tenantId",
  isAuthAdmin,
  AdminController.indexChatFlow
);

// ====================
// Rota para atualizar as configurações de um inquilino específico (PUT)
// ====================
// O ID do inquilino é passado como parâmetro na URL
adminRoutes.put(
  "/admin/settings/:tenantId",
  isAuthAdmin,
  AdminController.updateSettings
);

// ====================
// Rota para listar todos os canais (GET)
// ====================
adminRoutes.get("/admin/channels", isAuthAdmin, AdminController.indexChannels);

// ====================
// Rota para criar um novo canal (POST)
// ====================
adminRoutes.post("/admin/channels", isAuthAdmin, AdminController.storeChannel);

// ====================
// Rota para associar um usuário a inquilinos (POST)
// ====================
adminRoutes.post("/admin/userTenants", isAuthAdmin, AdminController.storeUser);

// Exporta as rotas do administrador para uso em outras partes da aplicação
export default adminRoutes;
