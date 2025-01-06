/* eslint-disable camelcase */
import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "path";
import { rm } from "fs/promises";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import Queue from "./Queue";
import AppError from "../errors/AppError";
const minimalArgs = require('./minimalArgs');

// ====================
// Definição da Interface
// ====================

interface Session extends Client {
  id: number; // ID da sessão
  checkMessages: any; // Função para verificar mensagens
}

// Armazena as sessões ativas do WhatsApp
const sessions: Session[] = [];

// Função para apagar a pasta da sessão
export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".wwebjs_auth"); // Caminho raiz para a pasta de autenticação
  const pathSession = `${pathRoot}/session-wbot-${id}`; // Caminho da sessão a ser apagada
  try {
    await rm(pathSession, { recursive: true, force: true }); // Remove a pasta da sessão
  } catch (error) {
    logger.info(`apagarPastaSessao:: ${pathSession}`); // Registra informação no logger
    logger.error(error); // Registra erro no logger
  }
};

// Função para remover a sessão do WhatsApp
export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId); // Verifica se a sessão existe
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy(); // Destrói a sessão
      sessions.splice(sessionIndex, 1); // Remove a sessão da lista
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`); // Registra erro no logger
  }
};

// Configura os argumentos para o bot
const args: string[] = process.env.CHROME_ARGS
  ? process.env.CHROME_ARGS.split(",") // Extrai os argumentos do ambiente
  : minimalArgs; // Usa os argumentos mínimos se não houver configuração

args.unshift(`--user-agent=${DefaultOptions.userAgent}`); // Adiciona o user-agent aos argumentos

// Função para verificar mensagens
const checkMessages = async (wbot: Session, tenantId: number | string) => {
  try {
    const isConnectStatus = wbot && (await wbot.getState()) === "CONNECTED"; // Verifica o status de conexão
    logger.info( // Registra informações de verificação de mensagens
      "wbot:checkMessages:status",
      wbot.id,
      tenantId,
      isConnectStatus
    );

    if (isConnectStatus) {
      logger.info("wbot:connected:checkMessages", wbot, tenantId); // Registra que o bot está conectado
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId }); // Adiciona job para enviar mensagens
    }
  } catch (error) {
    const strError = String(error); // Converte o erro para string
    // se a sessão tiver sido fechada, limpar a checagem de mensagens e bot
    if (strError.indexOf("Session closed.") !== -1) {
      logger.error( // Registra erro de desconexão
        `BOT Whatsapp desconectado. Tenant: ${tenantId}:: BOT ID: ${wbot.id}`
      );
      clearInterval(wbot.checkMessages); // Limpa o intervalo de verificação de mensagens
      removeWbot(wbot.id); // Remove a sessão do bot
      return;
    }
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error); // Registra erro no logger
  }
};

// Função para inicializar o bot do WhatsApp
export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO(); // Obtém a instância do socket
      const sessionName = whatsapp.name; // Extrai o nome da conexão
      const { tenantId } = whatsapp; // Extrai o ID do inquilino da conexão
      let sessionCfg; // Variável para armazenar a configuração da sessão
      if (whatsapp?.session) {
        sessionCfg = JSON.parse(whatsapp.session); // Carrega a configuração da sessão se existir
      }

      const wbot = new Client({ // Cria uma nova instância do cliente do WhatsApp
        authStrategy: new LocalAuth({ clientId: `wbot-${whatsapp.id}` }),
        takeoverOnConflict: true,
        puppeteer: {
          // headless: false, // (Comentado, não utilizado)
          executablePath: process.env.CHROME_BIN || undefined, // Caminho do executável do Chrome
          args // Argumentos para o Chrome
        },
        webVersion: process.env.WEB_VERSION || "2.2412.54v2", // Versão da web do WhatsApp
        webVersionCache: { type: "local" }, // Cache da versão da web
        qrMaxRetries: 5 // Número máximo de tentativas para o QR code
      }) as Session;

      wbot.id = whatsapp.id; // Atribui o ID da conexão à sessão

      wbot.initialize(); // Inicializa o bot

      wbot.on("qr", async qr => { // Evento para quando o QR code é gerado
        if (whatsapp.status === "CONNECTED") return; // Se já estiver conectado, não faz nada
        logger.info( // Registra informações do QR code
          `Session QR CODE: ${sessionName}-ID: ${whatsapp.id}-${whatsapp.status}`
        );

        await whatsapp.update({ // Atualiza o status da conexão
          qrcode: qr, // Armazena o QR code
          status: "qrcode", // Atualiza o status para "qrcode"
          retries: 0 // Reseta o número de tentativas
        });
        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id); // Verifica se a sessão já existe
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id; // Atribui o ID da conexão à sessão
          sessions.push(wbot); // Adiciona a nova sessão à lista de sessões
        }

        io.emit(`${tenantId}:whatsappSession`, { // Emite evento de atualização de sessão
          action: "update",
          session: whatsapp // Dados da conexão
        });
      });

      wbot.on("authenticated", async () => { // Evento quando a autenticação é bem-sucedida
        logger.info(`Session: ${sessionName} AUTHENTICATED`); // Registra que a sessão foi autenticada
      });

      wbot.on("auth_failure", async msg => { // Evento quando a autenticação falha
        logger.error( // Registra erro de autenticação
          `Session: ${sessionName}-AUTHENTICATION FAILURE :: ${msg}`
        );
        if (whatsapp.retries > 1) {
          await whatsapp.update({ // Reseta a sessão se houver muitas tentativas
            retries: 0,
            session: ""
          });
        }

        const retry = whatsapp.retries; // Armazena o número de tentativas
        await whatsapp.update({ // Atualiza o status da conexão
          status: "DISCONNECTED",
          retries: retry + 1 // Incrementa o número de tentativas
        });

        io.emit(`${tenantId}:whatsappSession`, { // Emite evento de atualização de sessão
          action: "update",
          session: whatsapp // Dados da conexão
        });
        reject(new Error("Error starting whatsapp session.")); // Lança erro se a sessão não puder ser iniciada
      });

      wbot.on("ready", async () => { // Evento quando o bot está pronto
        logger.info(`Session: ${sessionName}-READY`); // Registra que a sessão está pronta

        const info: any = wbot?.info; // Armazena informações do bot
        const wbotVersion = await wbot.getWWebVersion(); // Obtém a versão do WhatsApp Web
        const wbotBrowser = await wbot.pupBrowser?.version(); // Obtém a versão do navegador
        await whatsapp.update({ // Atualiza o status da conexão
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot?.info?.wid?.user, // || wbot?.info?.me?.user,
          phone: {
            ...(info || {}),
            wbotVersion,
            wbotBrowser
          }
        });

        io.emit(`${tenantId}:whatsappSession`, { // Emite evento de atualização de sessão
          action: "update",
          session: whatsapp // Dados da conexão
        });

        io.emit(`${tenantId}:whatsappSession`, { // Emite evento de sessão pronta
          action: "readySession",
          session: whatsapp // Dados da conexão
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id); // Verifica se a sessão já existe
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id; // Atribui o ID da conexão à sessão
          sessions.push(wbot); // Adiciona a nova sessão à lista de sessões
        }

        wbot.sendPresenceAvailable(); // Envia presença disponível
        SyncUnreadMessagesWbot(false, wbot, tenantId); // Sincroniza mensagens não lidas (corrigido)
        resolve(wbot); // Retorna a sessão
      });

      wbot.checkMessages = setInterval( // Define um intervalo para verificar mensagens
        checkMessages,
        +(process.env.CHECK_INTERVAL || 5000), // Intervalo de verificação
        wbot,
        tenantId
      );
      // WhatsappConsumer(tenantId); // (Comentado, não utilizado)
    } catch (err) {
      logger.error(`initWbot error | Error: ${err}`); // Registra erro no logger
    }
  });
};

// Função para obter a instância do bot do WhatsApp
export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  if (sessionIndex === -1) {
    logger.error(`Sessão do WhatsApp não inicializada. ID: ${whatsappId}`);
    throw new AppError("A sessão do WhatsApp não está inicializada. Por favor, reconecte a sessão.", 400);
  }

  return sessions[sessionIndex];
};
