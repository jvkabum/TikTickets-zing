import { Request, Response } from "express";
// import path from "path"; // Importa o módulo path (comentado, não utilizado)
// import { rmdir } from "fs/promises"; // Importa a função rmdir do módulo fs/promises (comentado, não utilizado)
import { getWbot, removeWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { setValue } from "../libs/redisClient";
import { logger } from "../utils/logger";
import { getTbot, removeTbot } from "../libs/tbot";
import { getInstaBot, removeInstaBot } from "../libs/InstaBot";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import { cleanupSessionFiles, forceCleanupBeforeQrCode } from "../services/WbotServices/SessionCleanupService";
import Whatsapp from "../models/Whatsapp";

// Armazena timestamps dos QR codes por sessão
const qrCodeTimestamps = new Map<number, number>();

// ====================
// Função para armazenar uma nova sessão do WhatsApp
// ====================
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params; // Extrai o ID do WhatsApp dos parâmetros da requisição
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  }); // Obtém informações do WhatsApp

  StartWhatsAppSession(whatsapp); // Inicia a sessão do WhatsApp

  return res.status(200).json({ message: "Starting session." }); // Retorna resposta de sucesso
};

// ====================
// Função para atualizar uma sessão do WhatsApp
// ====================
export const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params; // Extrai o ID do WhatsApp dos parâmetros da requisição
  const { isQrcode } = req.body; // Extrai a informação se deve apagar a pasta da sessão
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado

  if (isQrcode) {
    logger.info(`Solicitada geração de novo QR code para WhatsApp ID: ${whatsappId}`);
    try {
      // Usa o novo método mais agressivo de limpeza para gerar QR code
      await forceCleanupBeforeQrCode(whatsappId);
    } catch (error) {
      logger.error(`Erro durante preparação para QR code: ${error}`);
      // Se falhar, tenta o método antigo como fallback
      await cleanupSessionFiles(whatsappId, "qrcode");
    }
  }

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" },
    tenantId
  }); // Atualiza as informações do WhatsApp

  // Aguarda um momento para garantir que os recursos foram liberados antes de iniciar nova sessão
  await new Promise(resolve => setTimeout(resolve, 1000));

  logger.info(`Iniciando nova sessão após limpeza para WhatsApp ID: ${whatsappId}`);
  StartWhatsAppSession(whatsapp); // Inicia a sessão do WhatsApp
  return res.status(200).json({ message: "Starting session." }); // Retorna resposta de sucesso
};

// ====================
// Função para remover uma sessão do WhatsApp
// ====================
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params; // Extrai o ID do WhatsApp dos parâmetros da requisição
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId }); // Obtém informações do canal do WhatsApp

  const io = getIO(); // Obtém a instância do socket

  try {
    logger.info(`[SESSION] Iniciando remocao de conexao ID ${whatsappId} para tenant ${tenantId}`);
    if (channel.type === "whatsapp") {
      try {
        const wbot = getWbot(channel.id);
        await setValue(`${channel.id}-retryQrCode`, 0);
        await setValue(`${channel.id}-manualDisconnect`, "true");
        await wbot.logout().catch(error => logger.error(`[SESSION] Erro no logout wbot: ${error.message}`));
        removeWbot(channel.id);
      } catch (e) {
        logger.warn(`[SESSION] Wbot nao encontrado para logout: ${e.message}`);
      }
    }

    if (channel.type === "telegram") {
      try {
        const tbot = getTbot(channel.id);
        await tbot.telegram.logOut().catch(error => logger.error(`[SESSION] Erro no logout tbot: ${error.message}`));
        removeTbot(channel.id);
      } catch (e) {
        logger.warn(`[SESSION] Tbot nao encontrado para logout: ${e.message}`);
      }
    }

    if (channel.type === "instagram") {
      try {
        const instaBot = getInstaBot(channel.id);
        await instaBot.destroy();
        removeInstaBot(channel);
      } catch (e) {
        logger.warn(`[SESSION] InstaBot nao encontrado para logout: ${e.message}`);
      }
    }

    await channel.update({
      status: "DISCONNECTED",
      session: "",
      qrcode: null,
      retries: 0,
      disconnectedAt: new Date()
    });

    return res.status(200).json({ message: "Session disconnected." });

  } catch (error) {
    logger.error(`[SESSION] Erro fatal ao remover sessao: ${error.message}`);

    // Tenta pelo menos atualizar o status no banco se algo falhar drasticamente
    try {
      await channel.update({ status: "DISCONNECTED", qrcode: null });
      io.emit(`${channel.tenantId}:whatsappSession`, { action: "update", session: channel });
    } catch (dbErr) {
      logger.error(`[SESSION] Erro ao forcar status DISCONNECTED: ${dbErr.message}`);
    }

    throw new AppError(`Erro ao desconectar sessão: ${error.message}`, 500);
  }
};

// Procura pela função destroy e encontra onde está sendo chamada a função apagarPastaSessao
export const destroy = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  try {
    // Verificar o status da conexão antes de prosseguir
    const whatsapp = await Whatsapp.findByPk(+whatsappId);
    if (!whatsapp) {
      throw new AppError("ERR_NO_WAPP_FOUND", 404);
    }

    // Se a sessão estiver conectada, desconectar primeiro
    if (whatsapp.status === "CONNECTED") {
      logger.info(`Sessão ${whatsappId} está ativa. Desconectando antes de destruir.`);
      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: "",
        retries: 0
      });

      // Emite evento de atualização da sessão
      const io = getIO();
      io.emit(`${tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    }

    // Remove da memória e limpa arquivos usando as funções melhoradas
    await removeWbot(+whatsappId);

    // Remove a confirmação de leitura
    await setValue(`wbotStatus-${whatsappId}`, false);

    return res.status(200).json({ message: "Session disconnected." });
  } catch (err) {
    logger.error(err);
    throw new AppError("ERR_DISCONNECT_WAPP", 500);
  }
};

export default { store, remove, update, destroy };
