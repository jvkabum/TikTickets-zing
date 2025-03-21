import Whatsapp from "../../models/Whatsapp";
import { getActiveWbot, removeWbot, apagarPastaSessao } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import { getIO } from "../../libs/socket";

// Verifica uma conexão específica do WhatsApp
export const verifyWhatsAppConnection = async (
  whatsappId: number | string
): Promise<boolean> => {
  try {
    logger.info(`Verificando conexão do WhatsApp ID: ${whatsappId}`);
    const whatsapp = await Whatsapp.findByPk(whatsappId as number);
    
    if (!whatsapp) {
      logger.error(`WhatsApp ID ${whatsappId} não encontrado`);
      return false;
    }
    
    // Se não estiver conectado ou estiver em processo de abertura, não tenta reconectar
    if (whatsapp.status !== "CONNECTED") {
      // Se estiver em processo de abertura, apenas registra e retorna
      if (whatsapp.status === "OPENING") {
        logger.info(`WhatsApp ID ${whatsappId} está em processo de conexão (${whatsapp.status}). Aguardando...`);
        return false;
      }
      
      logger.info(`WhatsApp ID ${whatsappId} não está conectado (${whatsapp.status})`);
      return false;
    }
    
    try {
      // Tenta usar a função getActiveWbot que faz verificação de conexão real
      await getActiveWbot(whatsapp.id);
      logger.info(`WhatsApp ID ${whatsappId} está realmente conectado`);
      
      // Reseta contador de tentativas de reconexão
      if (whatsapp.retries > 0) {
        await whatsapp.update({ retries: 0 });
      }
      
      return true;
    } catch (connectionError) {
      logger.error(`Falha na verificação de conexão para WhatsApp ID ${whatsappId}: ${connectionError}`);
      
      // Verifica se atingiu o limite de tentativas (3)
      if (whatsapp.retries >= 3) {
        logger.error(`Máximo de tentativas de reconexão atingido para WhatsApp ID ${whatsappId}. Marcando como desconectado.`);
        
        // Marca como desconectado
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });
        
        const io = getIO();
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
          message: "Desconectado após múltiplas falhas de reconexão"
        });
        
        // Limpa recursos
        try {
          await removeWbot(whatsapp.id);
        } catch (cleanupError) {
          logger.error(`Erro ao limpar recursos após falhas de reconexão: ${cleanupError}`);
          // Tenta limpar a pasta da sessão diretamente
          await apagarPastaSessao(whatsapp.id);
        }
        
        return false;
      }
      
      // Tenta reiniciar a sessão
      try {
        logger.info(`Tentando reiniciar sessão para WhatsApp ID ${whatsappId} (tentativa ${whatsapp.retries + 1}/3)`);
        const io = getIO();
        
        // Limpa recursos antes de tentar reconectar
        try {
          await removeWbot(whatsapp.id);
        } catch (cleanupError) {
          logger.error(`Erro ao limpar recursos antes da reconexão: ${cleanupError}`);
          // Tenta limpar a pasta da sessão diretamente
          await apagarPastaSessao(whatsapp.id);
        }
        
        // Espera 30 segundos antes de tentar reconectar (exceto na primeira tentativa)
        if (whatsapp.retries > 0) {
          logger.info(`Aguardando 30 segundos antes de tentar reconectar WhatsApp ID ${whatsappId}...`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
        // Verifica novamente o status antes de iniciar a reconexão
        const freshWhatsapp = await Whatsapp.findByPk(whatsapp.id);
        if (freshWhatsapp && freshWhatsapp.status === "CONNECTED") {
          logger.info(`WhatsApp ID ${whatsappId} já reconectado por outro processo. Ignorando.`);
          return true;
        }
        
        await whatsapp.update({
          status: "OPENING",
          qrcode: "",
          retries: whatsapp.retries + 1
        });
        
        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
          message: `Reconexão iniciada após verificação programada (tentativa ${whatsapp.retries}/3)`
        });
        
        // Inicia o processo de reconexão
        await StartWhatsAppSession(whatsapp);
        return false;
      } catch (reconnectError) {
        logger.error(`Erro ao tentar reconectar WhatsApp ID ${whatsappId}: ${reconnectError}`);
        return false;
      }
    }
  } catch (error) {
    logger.error(`Erro geral ao verificar conexão do WhatsApp ID ${whatsappId}: ${error}`);
    return false;
  }
};

// Verifica todas as conexões ativas
export const verifyAllWhatsAppConnections = async (): Promise<void> => {
  try {
    // Busca todas as conexões com status CONNECTED
    const whatsapps = await Whatsapp.findAll({
      where: {
        status: "CONNECTED",
        isActive: true
      }
    });
    
    logger.info(`Verificando ${whatsapps.length} conexões WhatsApp ativas`);
    
    // Verifica cada conexão individualmente
    const verificationPromises = whatsapps.map(async (whatsapp) => {
      await verifyWhatsAppConnection(whatsapp.id);
    });
    
    await Promise.all(verificationPromises);
  } catch (error) {
    logger.error(`Erro ao verificar todas as conexões WhatsApp: ${error}`);
  }
};

// Função para ser chamada periodicamente (por exemplo, a cada 15 minutos)
export const scheduleConnectionVerification = (): any => {
  // Executa a primeira verificação após 5 minutos do início do servidor
  const initialDelay = 5 * 60 * 1000; // 5 minutos
  
  // Depois, a cada 15 minutos
  const verificationInterval = 15 * 60 * 1000; // 15 minutos (reduzido de 30 para 15)
  
  // Programa a primeira execução
  const firstTimer = setTimeout(() => {
    verifyAllWhatsAppConnections();
    
    // Configura as execuções subsequentes
    setInterval(verifyAllWhatsAppConnections, verificationInterval);
  }, initialDelay);
  
  logger.info(`Verificação de conexões programada: primeira execução em ${initialDelay/1000/60} minutos, depois a cada ${verificationInterval/1000/60} minutos`);
  
  // Retorna o timer para possível cancelamento
  return firstTimer;
};

export default {
  verifyWhatsAppConnection,
  verifyAllWhatsAppConnections,
  scheduleConnectionVerification
};
