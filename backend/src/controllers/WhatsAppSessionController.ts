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
const store = async (req: Request, res: Response): Promise<Response> => {
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
const update = async (req: Request, res: Response): Promise<Response> => {
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
      await cleanupSessionFiles(whatsappId, true);
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
const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params; // Extrai o ID do WhatsApp dos parâmetros da requisição
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId }); // Obtém informações do canal do WhatsApp

  const io = getIO(); // Obtém a instância do socket

  try {
    if (channel.type === "whatsapp") {
      const wbot = getWbot(channel.id); // Obtém a instância do bot do WhatsApp
      await setValue(`${channel.id}-retryQrCode`, 0); // Reseta o contador de tentativas de QR Code
      
      // Define um valor no Redis para indicar que a desconexão foi manual
      await setValue(`${channel.id}-manualDisconnect`, "true");
      
      await wbot
        .logout()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error)); // Fecha a conexão e conserva a sessão para reconexão
      removeWbot(channel.id); // Remove o bot do WhatsApp
    }

    if (channel.type === "telegram") {
      const tbot = getTbot(channel.id); // Obtém a instância do bot do Telegram
      await tbot.telegram
        .logOut()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error)); // Faz logout do bot do Telegram
      removeTbot(channel.id); // Remove o bot do Telegram
    }

    if (channel.type === "instagram") {
      const instaBot = getInstaBot(channel.id); // Obtém a instância do bot do Instagram
      await instaBot.destroy(); // Destrói a instância do bot do Instagram
      removeInstaBot(channel); // Remove o bot do Instagram
    }

    await channel.update({
      status: "DISCONNECTED", // Atualiza o status do canal para desconectado
      session: "", // Limpa a sessão
      qrcode: null, // Limpa o QR Code
      retries: 0, // Reseta o contador de tentativas
      disconnectedAt: new Date() // Adiciona a data de desconexão
    });
  } catch (error) {
    logger.error(error); // Registra erro no logger
    await channel.update({
      status: "DISCONNECTED", // Atualiza o status do canal para desconectado
      session: "", // Limpa a sessão
      qrcode: null, // Limpa o QR Code
      retries: 0 // Reseta o contador de tentativas
    });

    io.emit(`${channel.tenantId}:whatsappSession`, {
      action: "update",
      session: channel // Emite evento de atualização da sessão
    });
    throw new AppError("ERR_NO_WAPP_FOUND", 404); // Lança erro se não encontrar a sessão do WhatsApp
  }
  return res.status(200).json({ message: "Session disconnected." }); // Retorna resposta de sucesso
};

// Procura pela função destroy e encontra onde está sendo chamada a função apagarPastaSessao
const destroy = async (req: Request, res: Response): Promise<Response> => {
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

export default { store, remove, update, destroy }; // Exporta as funções para uso em outras partes da aplicação
