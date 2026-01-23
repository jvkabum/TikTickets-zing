/* eslint-disable camelcase */
import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "path";
import { rm } from "fs/promises";
import fs from "fs";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import Queue from "./Queue";
import AppError from "../errors/AppError";
import {
  cleanupWbotSession,
  cleanupSessionFiles,
  killChromiumProcesses,
  killSessionChromiumProcesses
} from "../services/WbotServices/SessionCleanupService";
import { Session as WbotSession } from "../types/WhatsAppSession";
import { getValue, setValue } from "./redisClient";
import { promisify } from "util";
import { exec } from "child_process";
import { unlink } from "fs/promises";
const minimalArgs = require('./minimalArgs');

// ====================
// Definição da Interface
// ====================

interface Session extends Client {
  id: number; // ID da sessão
  checkMessages: any; // Função para verificar mensagens
  lastConnectionVerification?: number; // Última verificação de conexão
  reconnectionAttempts?: number; // Contador de tentativas de reconexão
  monitorInterval?: any; // Intervalo para monitoramento da sessão
  clientId?: number; // ID do cliente
  close?: () => void; // Função para fechar a sessão
}

// Armazena as sessões ativas do WhatsApp
const sessions: WbotSession[] = [];

// Mapa de sessões com conexão verificada
const verifiedConnections = new Map<number, boolean>();

// Função para apagar a pasta da sessão de forma recursiva e segura
export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  // Redirecionando para o serviço centralizado
  await cleanupSessionFiles(id);
};

// Função para remover a sessão do WhatsApp
export const removeWbot = async (whatsappId: number): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];

      // Limpa intervalos
      if (session.checkMessages) {
        clearInterval(session.checkMessages);
      }

      if (session.monitorInterval) {
        clearInterval(session.monitorInterval);
      }

      // Tenta destruir a sessão de forma segura
      try {
        // @ts-ignore - Usando destroy que está disponível mas não tipado
        if (session.destroy) await session.destroy();
      } catch (err) {
        logger.error(`Erro ao destruir sessão: ${err}`);
      }

      // Remove da lista de sessões
      sessions.splice(sessionIndex, 1);
    }

    // Limpa registro de conexão verificada 
    verifiedConnections.delete(whatsappId);

    // Limpa os arquivos da sessão
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp || whatsapp.status === "DISCONNECTED") {
      // Somente limpa os arquivos se a sessão estiver desconectada
      logger.info(`Limpando arquivos da sessão ${whatsappId}`);
      await cleanupSessionFiles(whatsappId, "disconnect"); // Força a limpeza quando a sessão está desconectada
    } else {
      logger.info(`Sessão ${whatsappId} ainda ativa (${whatsapp.status}). Mantendo arquivos de sessão.`);
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`); // Registra erro no logger
  }
};

// Função para verificar a conexão real com o WhatsApp (não apenas o estado)
const verifyRealConnection = async (wbot: Session): Promise<boolean> => {
  try {
    if (!wbot) return false;

    // Obtém o estado atual
    const state = await wbot.getState();
    if (state !== "CONNECTED") return false;

    // Múltiplas verificações para confirmar conexão ativa
    let connectionVerified = false;

    // Tentativa 1: Obter foto de perfil
    try {
      await wbot.getProfilePicUrl(wbot.info.wid._serialized);
      connectionVerified = true;
      logger.info(`✅ Conexão verificada via foto de perfil para sessão ${wbot.id} | Status: CONECTADO | Nome: ${wbot.info.pushname || 'Não disponível'}`);

      // Registra que esta sessão tem conexão verificada
      verifiedConnections.set(wbot.id, true);
    } catch (profileError) {
      logger.warn(`❌ Falha na verificação de conexão via foto de perfil para sessão ${wbot.id}: ${profileError}. Tentando outro método...`);
    }

    // Tentativa 2: Verificar status do telefone
    if (!connectionVerified) {
      try {
        const phoneStatus = await wbot.getState();
        if (phoneStatus === "CONNECTED") {
          connectionVerified = true;
          logger.info(`✅ Conexão verificada via estado do telefone para sessão ${wbot.id} | Status: ${phoneStatus} | Número: ${wbot.info.wid.user}`);
          verifiedConnections.set(wbot.id, true);
        }
      } catch (statusError) {
        logger.warn(`❌ Falha na verificação de conexão via estado do telefone para sessão ${wbot.id}: ${statusError}. Tentando outro método...`);
      }
    }

    // Tentativa 3: Verificar WhatsApp Business is_connected
    if (!connectionVerified) {
      try {
        const isWhatsAppConnected = wbot.info && wbot.info.phone && wbot.info.phone.wa_version;
        if (isWhatsAppConnected) {
          connectionVerified = true;
          logger.info(`✅ Conexão verificada via info.phone para sessão ${wbot.id} | Versão WA: ${wbot.info.phone.wa_version} | Plataforma: ${wbot.info.platform || 'Não disponível'}`);
          verifiedConnections.set(wbot.id, true);
        }
      } catch (waError) {
        logger.warn(`❌ Falha na verificação de conexão via info.phone para sessão ${wbot.id}: ${waError}`);
      }
    }

    // Tentativa 4: Registrar evento no sistema (verificação de escrita)
    if (!connectionVerified) {
      try {
        // Tentamos registrar um evento no sistema para verificar se a conexão permite ações de escrita
        await Whatsapp.update(
          { status: "CONNECTED", retries: 0 },
          { where: { id: wbot.id } }
        );
        connectionVerified = true;
        logger.info(`✅ Conexão verificada via escrita no banco para sessão ${wbot.id} | Timestamp: ${new Date().toISOString()}`);
        verifiedConnections.set(wbot.id, true);
      } catch (dbError) {
        logger.warn(`❌ Falha na verificação de conexão via escrita no banco para sessão ${wbot.id}: ${dbError}`);
      }
    }

    // Se alguma das verificações teve sucesso, atualizamos o timestamp e resetamos tentativas
    if (connectionVerified) {
      wbot.lastConnectionVerification = Date.now();
      wbot.reconnectionAttempts = 0; // Reseta o contador de tentativas
      return true;
    }

    logger.warn(`⚠️ ALERTA: Todas as verificações de conexão falharam para sessão ${wbot.id}. Estado atual: ${await wbot.getState()}`);
    verifiedConnections.set(wbot.id, false);
    return false;
  } catch (error) {
    logger.error(`Verificação de conexão real falhou: ${error}`);
    verifiedConnections.set(wbot.id, false);
    return false;
  }
};

// Função para forçar a reconexão de um bot
const forceReconnect = async (
  wbot: Session,
  tenantId: number | string
): Promise<boolean> => {
  try {
    // Verifica se a conexão já foi validada positivamente
    if (verifiedConnections.get(wbot.id) === true) {
      logger.info(`Sessão ${wbot.id} já tem conexão verificada. Abortando tentativa de reconexão.`);
      // Zera tentativas de reconexão
      wbot.reconnectionAttempts = 0;
      return true;
    }

    logger.info(
      `Iniciando reconexão forçada para bot ${wbot.id}, tenant ${tenantId}`
    );

    // Inicializa o contador de tentativas se não existir
    if (!wbot.reconnectionAttempts) wbot.reconnectionAttempts = 0;

    // Incrementa o contador
    wbot.reconnectionAttempts += 1;

    // Limita a 5 tentativas de reconexão
    if (wbot.reconnectionAttempts > 5) {
      logger.error(
        `Máximo de tentativas de reconexão atingido para bot ${wbot.id}. Desconectando.`
      );

      // Atualiza o status no banco de dados
      try {
        const whatsapp = await Whatsapp.findByPk(wbot.id);
        if (whatsapp) {
          await whatsapp.update({
            status: "DISCONNECTED",
            qrcode: "",
            retries: 0
          });

          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }
      } catch (dbError) {
        logger.error(
          `Erro ao atualizar status após falha de reconexão: ${dbError}`
        );
      }

      // Remove o bot da lista de sessões
      removeWbot(wbot.id);
      return false;
    }

    // Tenta reconectar
    try {
      logger.info(
        `Tentativa ${wbot.reconnectionAttempts} de reconexão para bot ${wbot.id}`
      );

      // Calcula tempo de espera baseado no número da tentativa
      const waitTimeBeforeCleanup = wbot.reconnectionAttempts > 1 ?
        wbot.reconnectionAttempts * 5000 : 2000; // 2s, 10s, 15s, 20s, 25s

      // Espera um tempo antes de iniciar
      logger.info(`Aguardando ${waitTimeBeforeCleanup / 1000}s antes de iniciar tentativa...`);
      await new Promise(resolve => setTimeout(resolve, waitTimeBeforeCleanup));

      // Abordagem progressiva de reconexão
      const isLightReconnect = wbot.reconnectionAttempts <= 2; // Tentativas 1-2: reconexão leve
      const isMediumReconnect = wbot.reconnectionAttempts === 3 || wbot.reconnectionAttempts === 4; // Tentativas 3-4: limpeza parcial
      const isHeavyReconnect = wbot.reconnectionAttempts === 5; // Tentativa 5: limpeza completa

      // Verifica o status atual antes de tentar reconectar
      const whatsapp = await Whatsapp.findByPk(wbot.id);
      if (whatsapp && whatsapp.status === "CONNECTED") {
        logger.info(
          `Sessão ${wbot.id} já está conectada. Abortando reconexão.`
        );
        wbot.reconnectionAttempts = 0;
        return true;
      }

      if (isLightReconnect) {
        // Tentativas 1-2: Apenas tenta reinicializar sem limpar
        logger.info(`Reconexão leve para sessão ${wbot.id} (tentativa ${wbot.reconnectionAttempts})`);

        // Atualiza o status para OPENING
        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });

          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }
      }
      else if (isMediumReconnect) {
        // Tentativas 3-4: Limpa recursos leves e reinicializa
        logger.info(`Reconexão média para sessão ${wbot.id} (tentativa ${wbot.reconnectionAttempts})`);

        // Apenas mata os processos do Chrome relacionados a esta sessão sem destruir a sessão
        try {
          // Usa a função centralizada para matar processos específicos
          await killSessionChromiumProcesses(wbot.id);
          logger.info(`Processos Chrome da sessão ${wbot.id} encerrados`);
        } catch (cleanupError) {
          logger.error(`Erro na limpeza antes da reconexão: ${cleanupError}`);
        }

        // Atualiza o status para OPENING
        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });

          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }

        // Espera um tempo médio para garantir que os recursos foram liberados
        const midWaitTime = 3000;
        logger.info(`Aguardando ${midWaitTime / 1000}s após limpeza parcial...`);
        await new Promise(resolve => setTimeout(resolve, midWaitTime));
      }
      else if (isHeavyReconnect) {
        // Tentativa 5: Limpeza completa antes de reinicializar
        logger.info(`Reconexão pesada (completa) para sessão ${wbot.id} (tentativa final)`);

        // Limpa recursos antes de tentar nova conexão
        try {
          // Usa a função centralizada para limpar a sessão
          await cleanupWbotSession(wbot.id);
          logger.info(`Limpeza completa de sessão realizada para ID: ${wbot.id}`);
        } catch (cleanupError) {
          logger.error(`Erro na limpeza antes da reconexão: ${cleanupError}`);
        }

        // Atualiza o status para OPENING
        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });

          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }

        // Tempo de espera mais longo após a limpeza para garantir que os recursos foram liberados
        const postCleanupWaitTime = 6000; // 6 segundos
        logger.info(
          `Aguardando ${postCleanupWaitTime / 1000}s após limpeza completa da sessão ${wbot.id}...`
        );
        await new Promise(resolve => setTimeout(resolve, postCleanupWaitTime));
      }

      // Tenta reinicializar o cliente
      logger.info(`Reinicializando cliente para sessão ${wbot.id}...`);
      try {
        await wbot.resetState();
      } catch (resetErr) {
        logger.error(`Erro ao resetar estado: ${resetErr}. Continuando mesmo assim...`);
      }

      try {
        // Configura um timeout maior para a inicialização
        const initOptions = {
          ...minimalArgs,
          timeout: 90000 // 90 segundos de timeout
        };

        // Inicializa com as opções personalizadas
        await wbot.initialize();
        logger.info(`Cliente reinicializado com sucesso para sessão ${wbot.id}`);

        // Espera mais tempo antes de verificar a conexão
        // A primeira conexão pode levar mais tempo para estabelecer os canais
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (initErr) {
        throw new Error(`Falha na inicialização: ${initErr}`);
      }

      // Espera um pouco mais antes de verificar a conexão
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verifica se a reconexão foi bem-sucedida com menos rigor na primeira verificação
      let isConnectedAttempts = 0;
      let isConnected = false;

      // Tenta verificar a conexão várias vezes antes de desistir
      while (!isConnected && isConnectedAttempts < 3) {
        isConnectedAttempts++;
        try {
          logger.info(`Tentativa ${isConnectedAttempts}/3 de verificar conexão para sessão ${wbot.id}`);
          isConnected = await verifyRealConnection(wbot);

          if (!isConnected) {
            // Espera entre tentativas
            const waitTime = 3000 * isConnectedAttempts;
            logger.info(`Conexão ainda não estabelecida. Aguardando ${waitTime / 1000}s antes da próxima verificação...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (verifyErr) {
          logger.error(`Erro ao verificar conexão na tentativa ${isConnectedAttempts}: ${verifyErr}`);
        }
      }

      if (isConnected) {
        logger.info(`Reconexão bem-sucedida para bot ${wbot.id}`);

        // Atualiza o status para CONNECTED
        if (whatsapp) {
          await whatsapp.update({
            status: "CONNECTED",
            qrcode: "",
            retries: 0
          });

          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, {
            action: "update",
            session: whatsapp
          });
        }

        // Reseta contador de tentativas
        wbot.reconnectionAttempts = 0;
        return true;
      }
      throw new Error("Falha na verificação após reconexão");
    } catch (reconnectError) {
      logger.error(
        `Erro na tentativa ${wbot.reconnectionAttempts} de reconexão: ${reconnectError}`
      );

      // Verificar se é um erro de sessão fechada
      const errorStr = String(reconnectError);
      if (errorStr.includes("Session closed")) {
        logger.info(`Detectado erro de sessão fechada. Aguardando para nova tentativa...`);

        // Se não é a última tentativa, não faz nada especial, só retorna false
        // para que o sistema tente novamente na próxima verificação
        if (wbot.reconnectionAttempts < 5) {
          return false;
        }
      }

      // Aguarda antes de tentar novamente (será tratado na próxima chamada)
      return false;
    }
  } catch (error) {
    logger.error(`Erro geral na reconexão forçada: ${error}`);
    return false;
  }
};

// Função para verificar mensagens
const checkMessages = async (wbot: Session, tenantId: number | string) => {
  if (!wbot) {
    logger.error(`Bot indefinido na verificação. Tenant: ${tenantId}`);
    return;
  }

  try {
    // Primeiro verifica se a sessão foi desconectada manualmente
    // Se foi, não tenta reconectar automaticamente
    const manualDisconnect = await getValue(`${wbot.id}-manualDisconnect`);
    if (manualDisconnect === "true") {
      logger.info(`Sessão ${wbot.id} foi desconectada manualmente. Não tentando reconectar.`);
      return;
    }

    // Verifica se a conexão já foi validada como ativa
    if (verifiedConnections.get(wbot.id) === true) {
      // Se a conexão está verificada, apenas processa mensagens sem fazer verificações extras
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
      return;
    }

    // Verifica se o intervalo desde a última verificação é maior que 2 minutos
    // para não sobrecarregar com verificações excessivas
    const now = Date.now();
    const lastCheck = wbot.lastConnectionVerification || 0;
    const needsDeepCheck = now - lastCheck > 2 * 60 * 1000; // 2 minutos

    // Verifica o estado reportado pelo cliente
    let isConnectStatus = false;
    try {
      isConnectStatus = wbot && (await wbot.getState()) === "CONNECTED";
    } catch (stateError) {
      logger.error(`Erro ao obter estado da conexão: ${stateError}`);
      isConnectStatus = false;
    }

    // Se o estado reporta conectado, mas precisa de verificação profunda
    if (isConnectStatus && needsDeepCheck) {
      logger.info(`Realizando verificação profunda da conexão para bot ${wbot.id}, tenant ${tenantId}`);

      // Verifica se a conexão é realmente válida
      const reallyConnected = await verifyRealConnection(wbot);

      if (!reallyConnected) {
        logger.warn(`FALSA CONEXÃO DETECTADA: Bot ${wbot.id} reporta conectado mas não responde. Tentando reconectar...`);
        await forceReconnect(wbot, tenantId);
        return;
      }
    }

    // Se está realmente conectado, processa as mensagens
    if (isConnectStatus) {
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
    } else {
      // Verifica se a sessão foi desconectada manualmente antes de tentar reconectar
      if (manualDisconnect !== "true") {
        // Se o estado reporta desconectado, inicia reconexão
        logger.warn(`Bot ${wbot.id} reporta estado desconectado. Iniciando reconexão...`);
        await forceReconnect(wbot, tenantId);
      }
    }
  } catch (error) {
    const strError = String(error);
    if (strError.indexOf("Session closed.") !== -1) {
      logger.error(
        `BOT Whatsapp desconectado. Tenant: ${tenantId}:: BOT ID: ${wbot.id}`
      );

      // Verificar se a sessão foi desconectada manualmente
      const manualDisconnect = await getValue(`${wbot.id}-manualDisconnect`);
      if (manualDisconnect === "true") {
        logger.info(`Sessão ${wbot.id} foi desconectada manualmente. Não tentando reconectar após erro de sessão.`);
        return;
      }

      // Em vez de remover o bot imediatamente, vamos tentar reconectar
      logger.info(`Tentando reconectar após error de 'Session closed' para bot ${wbot.id}`);
      try {
        // Se não tem tentativas de reconexão configuradas, inicializa com 0
        if (!wbot.reconnectionAttempts) wbot.reconnectionAttempts = 0;

        // Tenta reconectar
        await forceReconnect(wbot, tenantId);

        // Se falhar a reconexão e já atingiu o limite de tentativas, remove o bot
        if (wbot.reconnectionAttempts > 5) {
          clearInterval(wbot.checkMessages);
          removeWbot(wbot.id);
        }
        return;
      } catch (reconnectError) {
        logger.error(`Falha ao tentar reconexão após erro de sessão: ${reconnectError}`);
        clearInterval(wbot.checkMessages);
        removeWbot(wbot.id);
        return;
      }
    }

    logger.error(`Erro na verificação de mensagens: ${error}`);
  }
};

// Função para obter a instância do bot do WhatsApp
export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    logger.error(`Sessão do WhatsApp não inicializada. ID: ${whatsappId}`);
    throw new AppError(
      "A sessão do WhatsApp não está inicializada. Por favor, reconecte a sessão.",
      400
    );
  }

  return sessions[sessionIndex] as Session;
};

// Função para verificar se a conexão está realmente ativa antes de usar
export const getActiveWbot = async (whatsappId: number): Promise<Session> => {
  const wbot = getWbot(whatsappId);

  // Se a conexão já foi verificada como ativa, retorna imediatamente
  if (verifiedConnections.get(whatsappId) === true) {
    return wbot;
  }

  // Caso contrário, faz a verificação completa
  const isConnected = await verifyRealConnection(wbot);

  if (!isConnected) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (whatsapp) {
      await forceReconnect(wbot, whatsapp.tenantId);
      // Verifica novamente após a tentativa de reconexão
      const reconnected = await verifyRealConnection(wbot);

      if (!reconnected) {
        throw new AppError("Falha ao se conectar com o WhatsApp. Tentativas de reconexão falharam.", 403);
      }
    }
  }

  return wbot;
};

// Configura os argumentos para o bot com opções adicionais para estabilidade
const args: string[] = [
  ...minimalArgs,
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-web-security',
  '--disable-features=site-per-process'
];

// Função para inicializar o bot do WhatsApp
export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      const { tenantId } = whatsapp;
      let sessionCfg;
      if (whatsapp?.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const wbot = new Client({
        authStrategy: new LocalAuth({
          clientId: `wbot-${whatsapp.id}`,
          dataPath: path.resolve(__dirname, "..", "..", ".wwebjs_auth")
        }),
        takeoverOnConflict: true,
        puppeteer: {
          executablePath: process.env.CHROME_BIN || undefined,
          args: args,
          defaultViewport: null,
          timeout: 120000,
          handleSIGINT: true
        },
        webVersion: process.env.WEB_VERSION || "2.2412.54v2",
        webVersionCache: { type: "local" },
        qrMaxRetries: 20
      }) as Session;

      // Variáveis de controle do Watchdog
      let readyFired = false;
      let watchdogTimer: NodeJS.Timeout | null = null;

      // Função unificada para tratar a inicialização (seja via evento 'ready' ou 'watchdog')
      const handleReady = async (source: string) => {
        if (readyFired) return;
        readyFired = true;
        if (watchdogTimer) clearTimeout(watchdogTimer);

        logger.info(`[${source}] Processando inicialização da sessão ${whatsapp.id}...`);

        const info: any = wbot?.info;
        const wbotVersion = await wbot.getWWebVersion();
        const wbotBrowser = await wbot.pupBrowser?.version();

        let profilePicUrl: string | null = null;
        try {
          const profilePic = await wbot.getProfilePicUrl(wbot.info.wid._serialized);
          profilePicUrl = profilePic;
        } catch (error) {
          logger.error(`Error getting profile picture: ${error}`);
        }

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot?.info?.wid?.user,
          profilePicUrl,
          phone: {
            ...(info || {}),
            wbotVersion,
            wbotBrowser
          }
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "readySession",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        // Verificação adicional para garantir estabilidade
        if (source === "WATCHDOG") {
          // Se foi iniciado pelo watchdog, a conexão já foi verificada, mas registramos log
          logger.info(`[WATCHDOG] Sessão ${whatsapp.id} inicializada via mecanismo de recuperação.`);
        } else {
          // Se foi via evento normal, fazemos uma verificação extra
          await verifyRealConnection(wbot);
        }

        wbot.sendPresenceAvailable();
        SyncUnreadMessagesWbot(wbot, tenantId);

        const checkInterval = +(process.env.CHECK_INTERVAL || 30000);
        wbot.checkMessages = setInterval(
          checkMessages,
          checkInterval,
          wbot,
          tenantId
        );

        resolve(wbot);
      };

      // Define a função do Watchdog
      const startWatchdog = () => {
        if (watchdogTimer) return;

        watchdogTimer = setTimeout(async () => {
          if (!readyFired) {
            logger.warn(`[WATCHDOG] Alerta: Evento 'ready' não disparou em 15s para sessão ${whatsapp.id}. Verificando conexão real...`);

            // Tenta verificar se está realmente conectado
            const isConnected = await verifyRealConnection(wbot);

            if (isConnected) {
              logger.info(`[WATCHDOG] Conexão válida detectada! Forçando inicialização...`);
              await handleReady("WATCHDOG");
            } else {
              logger.warn(`[WATCHDOG] Conexão não confirmada. Mantendo aguardo.`);
            }
          }
        }, 15000); // 15 segundos
      };

      process.on('SIGTERM', async () => {
        logger.info(`Processo recebeu SIGTERM, destruindo sessão ${whatsapp.id}`);
        try {
          await wbot.destroy();
        } catch (e) {
          logger.error(`Erro ao destruir sessão ${whatsapp.id} em SIGTERM: ${e}`);
        }
      });

      process.on('SIGINT', async () => {
        logger.info(`Processo recebeu SIGINT, destruindo sessão ${whatsapp.id}`);
        try {
          await wbot.destroy();
        } catch (e) {
          logger.error(`Erro ao destruir sessão ${whatsapp.id} em SIGINT: ${e}`);
        }
      });

      wbot.id = whatsapp.id;
      wbot.lastConnectionVerification = 0;
      wbot.reconnectionAttempts = 0;

      wbot.initialize();

      wbot.on("qr", async qr => {
        if (whatsapp.status === "CONNECTED") return;

        await whatsapp.update({
          qrcode: qr,
          status: "qrcode",
          retries: 0
        });
        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async () => {
        logger.info(`Sessão ${sessionName} autenticada com sucesso`);
        // Inicia o watchdog imediatamente após autenticação
        startWatchdog();
      });

      wbot.on('loading_screen', (percent, message) => {
        logger.info(`[${sessionName}] LOADING SCREEN: ${percent}% - ${message}`);
        // Se passar de 95% na loading screen, podemos considerar um sinal forte de que vai conectar
        // mas deixamos o watchdog validar via verifyRealConnection por segurança
      });

      wbot.on("auth_failure", async msg => {
        logger.error(`Session: ${sessionName}-AUTHENTICATION FAILURE :: ${msg}`);
        if (watchdogTimer) clearTimeout(watchdogTimer);

        if (whatsapp.retries > 1) {
          await whatsapp.update({
            retries: 0,
            session: ""
          });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        await handleReady("EVENTO READY");
      });
    } catch (error) {
      reject(error);
    }
  });
};
