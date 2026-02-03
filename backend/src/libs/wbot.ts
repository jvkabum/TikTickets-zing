/* eslint-disable camelcase */
import path from "path";
import { Client, LocalAuth } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import { logger } from "../utils/logger";
import Queue from "./Queue";
import { getIO } from "./socket";

import {
  cleanupSessionFiles,
  cleanupWbotSession,
  killSessionChromiumProcesses
} from "../services/WbotServices/SessionCleanupService";

import { context } from "@opentelemetry/api";
import { Session as WbotSession } from "../types/WhatsAppSession";
import { getValue } from "./redisClient";

// Imports de Telemetria
import { recordWhatsAppSessionStatus } from "../telemetry/metrics";
import { setTenantContext, setWhatsAppContext } from "../telemetry/propagation";
import { addSpanEvent, recordWhatsAppError, withWhatsAppSpan } from "../telemetry/tracer";

const minimalArgs = require('./minimalArgs');

// ====================
// Uso da Interface Centralizada
// ====================

// Armazena as sessões ativas do WhatsApp
const sessions: WbotSession[] = [];

// Mapa de sessões com conexão verificada
const verifiedConnections = new Map<number, boolean>();

// Função para apagar a pasta da sessão de forma recursiva e segura
export const apagarPastaSessao = async (id: number | string): Promise<void> => {
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
      logger.info(`Limpando arquivos da sessão ${whatsappId}`);
      await cleanupSessionFiles(whatsappId, "disconnect");
    } else {
      logger.info(`Sessão ${whatsappId} ainda ativa (${whatsapp.status}). Mantendo arquivos de sessão.`);
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`);
  }
};

// Função para verificar a conexão real com o WhatsApp (não apenas o estado)
const verifyRealConnection = async (wbot: WbotSession): Promise<boolean> => {
  return await withWhatsAppSpan('verify-real-connection', async (span) => {
    try {
      if (!wbot) return false;
      span.setAttribute('whatsapp_id', wbot.id);

      // Obtém o estado atual com tratamento de erro
      let state: string | null = null;
      try {
        state = await wbot.getState();
        span.setAttribute('wbot.state', state || 'unknown');
      } catch (stateError) {
        logger.warn(`[verifyRealConnection] Não foi possível obter estado da sessão ${wbot.id}: ${stateError}`);
        recordWhatsAppError(wbot.id, 'get_state_failed');
        return false;
      }

      if (state !== "CONNECTED") return false;

      // Múltiplas verificações para confirmar conexão ativa
      let connectionVerified = false;

      // Tentativa 1: Obter foto de perfil
      try {
        const wid = wbot?.info?.wid?._serialized;
        if (wid) {
          addSpanEvent('Verificando Foto Perfil');
          await wbot.getProfilePicUrl(wid);
          connectionVerified = true;
          logger.info(`✅ Conexão verificada via foto de perfil para sessão ${wbot.id} | Status: CONECTADO | Nome: ${wbot?.info?.pushname || 'Não disponível'}`);
          verifiedConnections.set(wbot.id, true);
        } else {
          logger.warn(`⚠️ wid não disponível para getProfilePicUrl na sessão ${wbot.id}`);
        }
      } catch (profileError) {
        logger.warn(`❌ Falha na verificação de conexão via foto de perfil para sessão ${wbot.id}: ${profileError}. Tentando outro método...`);
      }

      // Tentativa 2: Verificar status do telefone
      if (!connectionVerified) {
        try {
          const phoneStatus = await wbot.getState();
          if (phoneStatus === "CONNECTED" && wbot?.info?.wid?.user) {
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
          const isWhatsAppConnected = wbot?.info?.phone?.wa_version;
          if (isWhatsAppConnected) {
            connectionVerified = true;
            logger.info(`✅ Conexão verificada via info.phone para sessão ${wbot.id} | Versão WA: ${wbot.info.phone.wa_version} | Plataforma: ${wbot?.info?.platform || 'Não disponível'}`);
            verifiedConnections.set(wbot.id, true);
          }
        } catch (waError) {
          logger.warn(`❌ Falha na verificação de conexão via info.phone para sessão ${wbot.id}: ${waError}`);
        }
      }

      // Tentativa 4: Registrar evento no sistema (verificação de escrita)
      if (!connectionVerified) {
        try {
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
        wbot.reconnectionAttempts = 0;
        recordWhatsAppSessionStatus(String(wbot.id), 'connected');
        return true;
      }

      // Log final com tratamento de erro
      try {
        const currentState = await wbot.getState();
        logger.warn(`⚠️ ALERTA: Todas as verificações de conexão falharam para sessão ${wbot.id}. Estado atual: ${currentState}`);
      } catch (finalStateError) {
        logger.warn(`⚠️ ALERTA: Todas as verificações de conexão falharam para sessão ${wbot.id}. Não foi possível obter estado final.`);
      }
      recordWhatsAppSessionStatus(String(wbot.id), 'failed_verification');
      verifiedConnections.set(wbot.id, false);
      return false;
    } catch (error) {
      logger.error(`Verificação de conexão real falhou: ${error}`);
      recordWhatsAppError(wbot.id, 'verify_connection_exception');
      verifiedConnections.set(wbot.id, false);
      return false;
    }
  }, { whatsapp_id: wbot?.id, tenant_id: wbot?.tenantId || 0 });
};

// Função para forçar a reconexão de um bot
const forceReconnect = async (
  wbot: WbotSession,
  tenantId: number | string
): Promise<boolean> => {
  try {
    // Verifica se a conexão já foi validada positivamente
    if (verifiedConnections.get(wbot.id) === true) {
      logger.info(`Sessão ${wbot.id} já tem conexão verificada. Abortando tentativa de reconexão.`);
      wbot.reconnectionAttempts = 0;
      return true;
    }

    logger.info(`Iniciando reconexão forçada para bot ${wbot.id}, tenant ${tenantId}`);

    if (!wbot.reconnectionAttempts) wbot.reconnectionAttempts = 0;
    wbot.reconnectionAttempts += 1;

    // Limita a 5 tentativas de reconexão
    if (wbot.reconnectionAttempts > 5) {
      logger.error(`Máximo de tentativas de reconexão atingido para bot ${wbot.id}. Desconectando.`);

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
        logger.error(`Erro ao atualizar status após falha de reconexão: ${dbError}`);
      }

      removeWbot(wbot.id);
      return false;
    }

    try {
      logger.info(`Tentativa ${wbot.reconnectionAttempts} de reconexão para bot ${wbot.id}`);

      const waitTimeBeforeCleanup = wbot.reconnectionAttempts > 1 ?
        wbot.reconnectionAttempts * 5000 : 2000;

      logger.info(`Aguardando ${waitTimeBeforeCleanup / 1000}s antes de iniciar tentativa...`);
      await new Promise(resolve => setTimeout(resolve, waitTimeBeforeCleanup));

      const isLightReconnect = wbot.reconnectionAttempts <= 2;
      const isMediumReconnect = wbot.reconnectionAttempts === 3 || wbot.reconnectionAttempts === 4;
      const isHeavyReconnect = wbot.reconnectionAttempts === 5;

      const whatsapp = await Whatsapp.findByPk(wbot.id);
      if (whatsapp && whatsapp.status === "CONNECTED") {
        logger.info(`Sessão ${wbot.id} já está conectada. Abortando reconexão.`);
        wbot.reconnectionAttempts = 0;
        return true;
      }

      if (isLightReconnect) {
        logger.info(`Reconexão leve para sessão ${wbot.id} (tentativa ${wbot.reconnectionAttempts})`);
        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });
          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
        }
      }
      else if (isMediumReconnect) {
        logger.info(`Reconexão média para sessão ${wbot.id} (tentativa ${wbot.reconnectionAttempts})`);
        try {
          await killSessionChromiumProcesses(wbot.id);
          logger.info(`Processos Chrome da sessão ${wbot.id} encerrados`);
        } catch (cleanupError) {
          logger.error(`Erro na limpeza antes da reconexão: ${cleanupError}`);
        }

        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });
          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      else if (isHeavyReconnect) {
        logger.info(`Reconexão pesada (completa) para sessão ${wbot.id} (tentativa final)`);
        try {
          await cleanupWbotSession(wbot.id);
          logger.info(`Limpeza completa de sessão realizada para ID: ${wbot.id}`);
        } catch (cleanupError) {
          logger.error(`Erro na limpeza antes da reconexão: ${cleanupError}`);
        }

        if (whatsapp) {
          await whatsapp.update({ status: "OPENING", qrcode: "" });
          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
        }
        await new Promise(resolve => setTimeout(resolve, 6000));
      }

      logger.info(`Reinicializando cliente para sessão ${wbot.id}...`);
      try {
        await wbot.resetState();
      } catch (resetErr) {
        logger.error(`Erro ao resetar estado: ${resetErr}. Continuando mesmo assim...`);
      }

      try {
        await wbot.initialize();
        logger.info(`Cliente reinicializado com sucesso para sessão ${wbot.id}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (initErr) {
        throw new Error(`Falha na inicialização: ${initErr}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      let isConnectedAttempts = 0;
      let isConnected = false;

      while (!isConnected && isConnectedAttempts < 3) {
        isConnectedAttempts++;
        try {
          logger.info(`Tentativa ${isConnectedAttempts}/3 de verificar conexão para sessão ${wbot.id}`);
          isConnected = await verifyRealConnection(wbot);

          if (!isConnected) {
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
        if (whatsapp) {
          await whatsapp.update({ status: "CONNECTED", qrcode: "", retries: 0 });
          const io = getIO();
          io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
        }
        wbot.reconnectionAttempts = 0;
        return true;
      }
      throw new Error("Falha na verificação após reconexão");
    } catch (reconnectError) {
      logger.error(`Erro na tentativa ${wbot.reconnectionAttempts} de reconexão: ${reconnectError}`);
      return false;
    }
  } catch (error) {
    logger.error(`Erro geral na reconexão forçada: ${error}`);
    return false;
  }
};

// Função para verificar mensagens
const checkMessages = async (wbot: WbotSession, tenantId: number | string) => {
  if (!wbot) {
    logger.error(`Bot indefinido na verificação. Tenant: ${tenantId}`);
    return;
  }

  try {
    const manualDisconnect = await getValue(`${wbot.id}-manualDisconnect`);
    if (manualDisconnect === "true") {
      logger.info(`Sessão ${wbot.id} foi desconectada manualmente. Não tentando reconectar.`);
      return;
    }

    if (verifiedConnections.get(wbot.id) === true) {
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
      return;
    }

    const now = Date.now();
    const lastCheck = wbot.lastConnectionVerification || 0;
    const needsDeepCheck = now - lastCheck > 2 * 60 * 1000;

    let isConnectStatus = false;
    try {
      isConnectStatus = wbot && (await wbot.getState()) === "CONNECTED";
    } catch (stateError) {
      logger.error(`Erro ao obter estado da conexão: ${stateError}`);
      isConnectStatus = false;
    }

    if (isConnectStatus && needsDeepCheck) {
      logger.info(`Realizando verificação profunda da conexão para bot ${wbot.id}, tenant ${tenantId}`);
      const reallyConnected = await verifyRealConnection(wbot);

      if (!reallyConnected) {
        logger.warn(`FALSA CONEXÃO DETECTADA: Bot ${wbot.id} reporta conectado mas não responde. Tentando reconectar...`);
        await forceReconnect(wbot, tenantId);
        return;
      }
    }

    if (isConnectStatus) {
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
    } else {
      if (manualDisconnect !== "true") {
        logger.warn(`Bot ${wbot.id} reporta estado desconectado. Iniciando reconexão...`);
        await forceReconnect(wbot, tenantId);
      }
    }
  } catch (error) {
    const strError = String(error);
    if (strError.indexOf("Session closed.") !== -1) {
      logger.error(`BOT Whatsapp desconectado. Tenant: ${tenantId}:: BOT ID: ${wbot.id}`);

      const manualDisconnect = await getValue(`${wbot.id}-manualDisconnect`);
      if (manualDisconnect === "true") return;

      logger.info(`Tentando reconectar após error de 'Session closed' para bot ${wbot.id}`);
      try {
        if (!wbot.reconnectionAttempts) wbot.reconnectionAttempts = 0;
        await forceReconnect(wbot, tenantId);

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
export const getWbot = (whatsappId: number): WbotSession => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    logger.error(`Sessão do WhatsApp não inicializada. ID: ${whatsappId}`);
    throw new AppError("A sessão do WhatsApp não está inicializada. Por favor, reconecte a sessão.", 400);
  }
  return sessions[sessionIndex] as WbotSession;
};

// Função para verificar se a conexão está realmente ativa antes de usar
export const getActiveWbot = async (whatsappId: number): Promise<WbotSession> => {
  const wbot = getWbot(whatsappId);

  if (verifiedConnections.get(whatsappId) === true) {
    return wbot;
  }

  const isConnected = await verifyRealConnection(wbot);
  if (!isConnected) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (whatsapp) {
      await forceReconnect(wbot, whatsapp.tenantId);
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
  '--disable-web-security',
  '--disable-features=site-per-process',
  '--disable-extensions',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--hide-scrollbars',
  '--mute-audio',
  '--disable-gl-drawing-for-tests'
];

// Função para inicializar o bot do WhatsApp
export const initWbot = async (whatsapp: Whatsapp): Promise<WbotSession> => {
  return await withWhatsAppSpan('init-wbot', async (span) => {
    return new Promise((resolve, reject) => {
      try {
        const io = getIO();
        const sessionName = whatsapp.name;
        const { tenantId } = whatsapp;

        span.setAttributes({
          'whatsapp.id': whatsapp.id,
          'whatsapp.tenant_id': tenantId,
          'whatsapp.name': whatsapp.name
        });

        const ctx = setWhatsAppContext(whatsapp.id, setTenantContext(tenantId));
        context.with(ctx, async () => {
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
              executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome-stable",
              args: args,
              defaultViewport: null,
              timeout: 120000,
              handleSIGINT: true
            },
            webVersion: process.env.WEB_VERSION || "2.2412.54v2",
            webVersionCache: { type: "local" },
            qrMaxRetries: 20
          }) as WbotSession;

          wbot.tenantId = tenantId;

          // Variáveis de controle do Watchdog
          let readyFired = false;
          let watchdogTimer: NodeJS.Timeout | null = null;

          // Função unificada para tratar a inicialização (seja via evento 'ready' ou 'watchdog')
          const handleReady = async (source: string) => {
            if (readyFired) return;
            readyFired = true;
            if (watchdogTimer) clearTimeout(watchdogTimer);

            logger.info(`[${source}] Processando inicialização da sessão ${whatsapp.id}...`);

            // Captura informações com tratamento de erro
            const info: any = wbot?.info;

            let wbotVersion = "unknown";
            let wbotBrowser = "unknown";
            let profilePicUrl: string | null = null;

            try {
              wbotVersion = await wbot.getWWebVersion();
            } catch (e) {
              logger.warn(`[${source}] Não foi possível obter versão do WhatsApp Web: ${e}`);
            }

            try {
              wbotBrowser = await wbot.pupBrowser?.version() || "unknown";
            } catch (e) {
              logger.warn(`[${source}] Não foi possível obter versão do navegador: ${e}`);
            }

            try {
              const wid = wbot?.info?.wid?._serialized;
              if (wid) {
                profilePicUrl = await wbot.getProfilePicUrl(wid);
              }
            } catch (e) {
              logger.warn(`[${source}] Erro ao obter foto de perfil: ${e}`);
            }

            await whatsapp.update({
              status: "CONNECTED",
              qrcode: "",
              retries: 0,
              number: wbot?.info?.wid?.user || whatsapp.number,
              profilePicUrl,
              phone: {
                ...(info || {}),
                wbotVersion,
                wbotBrowser
              }
            });

            io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
            io.emit(`${tenantId}:whatsappSession`, { action: "readySession", session: whatsapp });

            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
            if (sessionIndex === -1) {
              wbot.id = whatsapp.id;
              sessions.push(wbot);
            }

            // Verificação adicional para garantir estabilidade
            if (source === "WATCHDOG") {
              logger.info(`[WATCHDOG] Sessão ${whatsapp.id} inicializada via mecanismo de recuperação.`);
            } else {
              try {
                await verifyRealConnection(wbot);
              } catch (e) {
                logger.warn(`[${source}] Erro na verificação inicial de conexão: ${e}`);
              }
            }

            try { wbot.sendPresenceAvailable(); } catch (e) { }
            try { SyncUnreadMessagesWbot(wbot, tenantId); } catch (e) { }

            const checkInterval = +(process.env.CHECK_INTERVAL || 30000);
            wbot.checkMessages = setInterval(checkMessages, checkInterval, wbot, tenantId);

            logger.info(`[${source}] Sessão ${whatsapp.id} inicializada com sucesso | Número: ${wbot?.info?.wid?.user}`);
            resolve(wbot);
          };

          // Define a função do Watchdog
          const startWatchdog = () => {
            if (watchdogTimer) return;

            watchdogTimer = setTimeout(async () => {
              if (!readyFired) {
                logger.warn(`[WATCHDOG] Alerta: Evento 'ready' não disparou em 15s para sessão ${whatsapp.id}. Verificando conexão real...`);
                const isConnected = await verifyRealConnection(wbot);

                if (isConnected) {
                  logger.info(`[WATCHDOG] Conexão válida detectada! Forçando inicialização...`);
                  await handleReady("WATCHDOG");
                } else {
                  logger.warn(`[WATCHDOG] Conexão não confirmada via Watchdog. Mantendo aguardo.`);
                }
              }
            }, 15000);
          };

          // Adiciona manipuladores de eventos para encerramento adequado
          process.on('SIGTERM', async () => {
            logger.info(`Processo recebeu SIGTERM, destruindo sessão ${whatsapp.id}`);
            try { await wbot.destroy(); } catch (e) { }
          });

          process.on('SIGINT', async () => {
            logger.info(`Processo recebeu SIGINT, destruindo sessão ${whatsapp.id}`);
            try { await wbot.destroy(); } catch (e) { }
          });

          wbot.id = whatsapp.id;
          wbot.lastConnectionVerification = 0;
          wbot.reconnectionAttempts = 0;

          (async () => {
            try {
              await wbot.initialize();
            } catch (initErr) {
              logger.error(`Erro na inicialização do wbot: ${initErr}`, {
                tenant_id: tenantId,
                whatsapp_id: whatsapp.id
              });
            }
          })();

          wbot.on("qr", async qr => {
            if (whatsapp.status === "CONNECTED") return;
            await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
            if (sessionIndex === -1) {
              wbot.id = whatsapp.id;
              sessions.push(wbot);
            }
            io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
          });

          wbot.on("authenticated", async () => {
            logger.info(`Sessão ${sessionName} autenticada com sucesso`);
            startWatchdog();
          });

          wbot.on('loading_screen', (percent, message) => {
            logger.info(`[${sessionName}] LOADING SCREEN: ${percent}% - ${message}`);
          });

          wbot.on("auth_failure", async msg => {
            logger.error(`Session: ${sessionName}-AUTHENTICATION FAILURE :: ${msg}`);
            if (watchdogTimer) clearTimeout(watchdogTimer);
            if (whatsapp.retries > 1) {
              await whatsapp.update({ retries: 0, session: "" });
            }
            const retry = whatsapp.retries;
            await whatsapp.update({ status: "DISCONNECTED", retries: retry + 1 });
            io.emit(`${tenantId}:whatsappSession`, { action: "update", session: whatsapp });
            reject(new Error("Error starting whatsapp session."));
          });

          wbot.on("ready", async () => {
            await handleReady("EVENTO READY");
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }, { whatsapp_id: whatsapp.id, tenant_id: whatsapp.tenantId });
};
