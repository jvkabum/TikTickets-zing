import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";

// Função aprimorada para identificar mais tipos de erros
const isConnectionError = (error: string): boolean => {
  const errorLower = error.toString().toLowerCase();
  const connectionErrors = [
    "session closed",
    "cannot read property",
    "not connected",
    "disconnected",
    "not authorized",
    "auth_failure",
    "protocol error",
    "read timed out",
    "connection timed out",
    "connect etimedout",
    "cannot get contacts",
    "no data received",
    "navigation failed",
    "page crashed",
    "session terminated",
    "cannot read",
    "not-authorized",
    "browser closed",
    "connection closed",
    "connection destroyed",
    "not authenticated",
    "timeout",
    "browser.close",
    "browser.disconnect",
    "err_wapp_not_initialized"
  ];
  
  // Verifica se o erro contém alguma das strings conhecidas
  return connectionErrors.some(errText => errorLower.includes(errText));
};

export const StartWhatsAppSessionVerify = async (
  whatsappId: number,
  error: string
): Promise<void> => {
  if (!isConnectionError(error)) {
    logger.info(`Erro não relacionado a conexão para whatsapp ${whatsappId}: ${error}`);
    return; // Se não for erro de conexão, não reiniciar sessão
  }

  try {
    logger.info(`Tentando reconectar sessão para whatsapp ${whatsappId}`);
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      logger.error(`Whatsapp com ID ${whatsappId} não encontrado`);
      return;
    }
    
    const { tenantId } = whatsapp;
    const io = getIO();

    // Verifica se já está tentando reconectar
    if (whatsapp.status === "OPENING") {
      logger.info(`Sessão ${whatsappId} já está em processo de reconexão. Ignorando.`);
      return;
    }
    
    // Atualiza para status de reconexão
    await whatsapp.update({ 
      status: "OPENING",
      qrcode: "",
      retries: whatsapp.retries + 1
    });
    
    io.emit(`${tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp,
      message: "Tentando reconectar automaticamente..."
    });

    // Se já tentou muitas vezes, marca como desconectado
    if (whatsapp.retries > 3) {
      logger.error(`Máximo de tentativas de reconexão para sessão ${whatsappId}. Marcando como DISCONNECTED.`);
      await whatsapp.update({ 
        status: "DISCONNECTED", 
        qrcode: "",
        retries: 0
      });
      
      io.emit(`${tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp,
        message: "Reconexão automática falhou após várias tentativas."
      });
      
      return;
    }
    
    // Aguarda um tempo antes de tentar reconectar (tempo exponencial com base no número de tentativas)
    const delay = Math.min(2000 * Math.pow(2, whatsapp.retries), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Tenta inicializar a sessão
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
    
    logger.info(`Sessão ${whatsappId} reconectada com sucesso`);
  } catch (err) {
    logger.error(`Erro ao tentar reconectar sessão ${whatsappId}: ${err}`);
  }
};
