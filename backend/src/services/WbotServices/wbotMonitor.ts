import { Client } from "whatsapp-web.js";

import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import { cleanupSessionFiles } from "./SessionCleanupService";

interface Session extends Client {
  id?: number;
  lastPing?: number;
  monitorInterval?: any;
  checkMessages?: any;
}

// Verifica se a conexão está realmente ativa, além do estado reportado
const checkRealConnection = async (wbot: Session): Promise<boolean> => {
  try {
    if (!wbot) return false;
    
    // Verifica se consegue obter o estado
    const state = await wbot.getState();
    if (state !== "CONNECTED") return false;
    
    // Faz uma requisição real ao WhatsApp
    // Substituindo getStatus por uma verificação de informações do perfil
    try {
      if (wbot.info && wbot.info.wid) {
        await wbot.getProfilePicUrl(wbot.info.wid._serialized);
        
        // Atualiza o timestamp do último ping bem-sucedido
        wbot.lastPing = Date.now();
        return true;
      }
      logger.error("wbot.info ou wbot.info.wid indefinido");
      return false;
    } catch (profileError) {
      logger.error(`Erro ao verificar foto de perfil: ${profileError}`);
      return false;
    }
  } catch (error) {
    logger.error(`Erro ao verificar conexão real: ${error}`);
    return false;
  }
};

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    // Inicializa a propriedade lastPing
    wbot.lastPing = Date.now();
    
    // Configura um intervalo para verificar a conexão real
    const pingInterval = 3 * 60 * 1000; // 3 minutos
    wbot.monitorInterval = setInterval(async () => {
      try {
        // Verifica se a conexão está realmente ativa
        const isConnected = await checkRealConnection(wbot);
        
        // Se não estiver conectado, mas o status reporta como conectado (falsa conexão)
        if (!isConnected && whatsapp.status === "CONNECTED") {
          logger.warn(
            `Falsa conexão detectada para ${sessionName}. Estado reportado como CONNECTED, mas verificação falhou. Forçando reconexão...`
          );
          
          // Limpa intervalos para evitar chamadas duplicadas
          if (wbot.monitorInterval) clearInterval(wbot.monitorInterval);
          if (wbot.checkMessages) clearInterval(wbot.checkMessages);
          
          try {
            // Tenta reconectar de forma forçada
            await whatsapp.update({
              status: "OPENING",
              retries: 0,
              qrcode: "",
              session: ""
            });
            
            io.emit(`${whatsapp.tenantId}:whatsappSession`, {
              action: "update",
              session: whatsapp,
              message: "Reconectando após detecção de falsa conexão"
            });
            
            // Remove arquivos de sessão anterior
            await cleanupSessionFiles(whatsapp.id, true);
            
            // Espera um pouco antes de reinicar a sessão
            setTimeout(() => StartWhatsAppSession(whatsapp), 3000);
          } catch (reconnectError) {
            logger.error(`Erro ao forçar reconexão: ${reconnectError}`);
          }
        }
      } catch (pingError) {
        logger.error(
          `Erro no intervalo de monitoramento para ${sessionName}: ${pingError}`
        );
      }
    }, pingInterval);

    // Monitora mudanças de estado
    wbot.on("change_state", async newState => {
      logger.info(`Monitor session: ${sessionName} - NewState: ${newState}`);
      try {
        await whatsapp.update({ status: newState });
        
        // Se o estado mudar para CONNECTED, atualiza o lastPing
        if (newState === "CONNECTED") {
          wbot.lastPing = Date.now();
        }
      } catch (err) {
        logger.error(`Erro ao atualizar estado: ${err}`);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    });

    // Monitora mudanças na bateria
    wbot.on("change_battery", async batteryInfo => {
      const { battery, plugged } = batteryInfo;
      logger.info(
        `Battery session: ${sessionName} ${battery}% - Charging? ${plugged}`
      );

      if (battery <= 20 && !plugged) {
        io.emit(`${whatsapp.tenantId}:change_battery`, {
          action: "update",
          batteryInfo: {
            ...batteryInfo,
            sessionName
          }
        });
      }

      try {
        await whatsapp.update({ battery, plugged });
      } catch (err) {
        logger.error(`Erro ao atualizar info de bateria: ${err}`);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    });

    // Monitora desconexões
    wbot.on("disconnected", async reason => {
      logger.info(`Disconnected session: ${sessionName} | Reason: ${reason}`);
      
      // Limpa os intervalos de monitoramento
      if (wbot.monitorInterval) clearInterval(wbot.monitorInterval);
      if (wbot.checkMessages) clearInterval(wbot.checkMessages);
      
      try {
        await whatsapp.update({
          status: "OPENING",
          session: "",
          qrcode: null
        });
        
        // Apaga dados da sessão anterior
        await cleanupSessionFiles(whatsapp.id);
        
        // Tenta reconectar após um breve atraso
        setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
      } catch (err) {
        logger.error(`Erro ao processar desconexão: ${err}`);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp,
        message: "Sessão desconectada. Tentando reconectar..."
      });
    });
    
    // Adiciona manipulador para eventos de reconexão automática do cliente
    wbot.on("ready", async () => {
      logger.info(`Sessão ${sessionName} pronta/reconectada`);
      wbot.lastPing = Date.now();
      
      try {
        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });
      } catch (err) {
        logger.error(`Erro ao atualizar estado após reconexão: ${err}`);
      }
      
      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp,
        message: "Sessão reconectada com sucesso"
      });
    });
  } catch (err) {
    logger.error(`Erro geral no wbotMonitor: ${err}`);
  }
  
  // Executa uma verificação inicial da conexão
  setTimeout(async () => {
    try {
      await checkRealConnection(wbot);
    } catch (initialCheckError) {
      logger.error(
        `Erro na verificação inicial da conexão: ${initialCheckError}`
      );
    }
  }, 10000);
};

export default wbotMonitor;
