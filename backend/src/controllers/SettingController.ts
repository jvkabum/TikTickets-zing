import { Request, Response } from "express"; 
import { getIO } from "../libs/socket"; 
import AppError from "../errors/AppError"; 

import UpdateSettingService from "../services/SettingServices/UpdateSettingService"; 
import ListSettingsService from "../services/SettingServices/ListSettingsService"; 
import { getDaysToClose, setDaysToClose } from "../services/SettingServices/ConfiguraFechamentoTicketService"; 

// ====================
// Função para listar configurações
// ====================
export const index = async (req: Request, res: Response): Promise<Response> => {
    const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado

    const settings = await ListSettingsService(tenantId); // Obtém as configurações do inquilino

    return res.status(200).json(settings); // Retorna as configurações em formato JSON
};

// ====================
// Função para atualizar uma configuração
// ====================
export const update = async (req: Request, res: Response): Promise<Response> => {
    if (req.user.profile !== "admin") { // Verifica se o usuário tem permissão de administrador
        throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se não tiver permissão
    }
    const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
    const { value, key } = req.body; // Extrai o valor e a chave do corpo da requisição

    const setting = await UpdateSettingService({
        key, // Chave da configuração a ser atualizada
        value, // Novo valor da configuração
        tenantId // ID do inquilino
    }); // Atualiza a configuração

    const io = getIO(); // Obtém a instância do socket
    io.emit(`${tenantId}:settings`, { // Emite evento de atualização de configurações
        action: "update",
        setting // Dados da configuração atualizada
    });

    return res.status(200).json(setting); // Retorna a configuração atualizada em formato JSON
};

// ====================
// Função para obter o valor de DAYS_TO_CLOSE_TICKET
// ====================
export const getDaysToCloseTicket = async (req: Request, res: Response): Promise<Response> => {
    try {
        const daysToClose = await getDaysToClose(); // Obtém o valor de dias para fechamento de tickets
        return res.json({ daysToClose }); // Retorna o valor em formato JSON
    } catch (error) {
        console.error("Erro ao obter configuração:", error); // Registra erro no console
        return res.status(500).json({ error: "Erro ao obter configuração" }); // Retorna erro em formato JSON
    }
};

// ====================
// Função para atualizar o valor de DAYS_TO_CLOSE_TICKET
// ====================
export const updateDaysToCloseTicket = async (req: Request, res: Response): Promise<Response> => {
    if (req.user.profile !== "admin") { // Verifica se o usuário tem permissão de administrador
        throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se não tiver permissão
    }
    
    const { daysToClose } = req.body; // Extrai o valor de dias para fechamento do corpo da requisição
    try {
        await setDaysToClose(daysToClose); // Atualiza o valor de dias para fechamento

        const io = getIO(); // Obtém a instância do socket
        io.emit("settings:update", { action: "update", key: "DAYS_TO_CLOSE_TICKET", value: daysToClose }); // Emite evento de atualização de configuração

        return res.status(200).json({ message: "Configuração atualizada com sucesso" }); // Retorna mensagem de sucesso
    } catch (error) {
        console.error("Erro ao atualizar configuração:", error); // Registra erro no console
        return res.status(500).json({ error: "Erro ao atualizar configuração" }); // Retorna erro em formato JSON
    }
};
