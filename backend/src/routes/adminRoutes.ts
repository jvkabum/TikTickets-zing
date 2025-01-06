import express from "express";
import * as AdminController from "../controllers/AdminController";
import isAuthAdmin from "../middleware/isAuthAdmin";

const adminRoutes = express.Router();

adminRoutes.get("/admin/users", isAuthAdmin, AdminController.indexUsers);
adminRoutes.put(
  "/admin/users/:userId",
  isAuthAdmin,
  AdminController.updateUser
);

adminRoutes.get("/admin/tenants", isAuthAdmin, AdminController.indexTenants);
adminRoutes.put(
  "/admin/tenantsUpdate/:tenantId",
  isAuthAdmin,
  AdminController.updateTenant
);

adminRoutes.post(
  "/admin/tenants",
  isAuthAdmin,
  AdminController.createTenant
);

adminRoutes.delete(
  "/admin/tenants/:tenantId",
  isAuthAdmin,
  AdminController.deleteTenant
);


adminRoutes.get(
  "/admin/chatflow/:tenantId",
  isAuthAdmin,
  AdminController.indexChatFlow
);
adminRoutes.put(
  "/admin/settings/:tenantId",
  isAuthAdmin,
  AdminController.updateSettings
);

adminRoutes.get("/admin/channels", isAuthAdmin, AdminController.indexChannels);
adminRoutes.post("/admin/channels", isAuthAdmin, AdminController.storeChannel);

adminRoutes.post("/admin/userTenants", isAuthAdmin, AdminController.storeUser);

export default adminRoutes;
