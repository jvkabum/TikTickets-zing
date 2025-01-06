import { Router } from "express";
import isAuth from "../middleware/isAuth";
import { validateDaysToCloseTicket } from "../middleware/validateDays"; // Middleware para validação
import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

// Rota para listar todas as configurações
settingRoutes.get("/settings", isAuth, async (req, res) => {
    try {
        await SettingController.index(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao listar configurações' });
    }
});

// Rota para atualizar configurações gerais
settingRoutes.put("/settings/:settingKey", isAuth, async (req, res) => {
    try {
        await SettingController.update(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar configuração' });
    }
});

export default settingRoutes;
    