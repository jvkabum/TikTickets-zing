import { Telegraf } from "telegraf";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

// ====================
// Definição da Interface
// ====================

interface Session extends Telegraf {
  id: number; // ID da sessão
}

// Armazena as sessões ativas do Telegram
const TelegramSessions: Session[] = [];

// Função para inicializar o bot do Telegram
export const initTbot = async (connection: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO(); // Obtém a instância do socket
      const sessionName = connection.name; // Extrai o nome da conexão
      const { tenantId } = connection; // Extrai o ID do inquilino da conexão
      const tbot = new Telegraf(connection.tokenTelegram, {}) as Session; // Cria uma nova instância do bot do Telegram
      tbot.id = connection.id; // Atribui o ID da conexão à sessão
      const sessionIndex = TelegramSessions.findIndex(
        s => s.id === connection.id // Verifica se a sessão já existe
      );
      if (sessionIndex === -1) {
        tbot.id = connection.id; // Atribui o ID da conexão à sessão
        TelegramSessions.push(tbot); // Adiciona a nova sessão à lista de sessões
      } else {
        tbot.id = connection.id; // Atribui o ID da conexão à sessão
        TelegramSessions[sessionIndex] = tbot; // Atualiza a sessão existente
      }
      tbot.launch(); // Inicia o bot do Telegram
      connection.update({ // Atualiza o status da conexão
        status: "CONNECTED",
        qrcode: "",
        retries: 0
      });

      io.emit(`${tenantId}:whatsappSession`, { // Emite evento de atualização de sessão
        action: "update",
        session: connection // Dados da conexão
      });

      logger.info(`Session TELEGRAM: ${sessionName} - READY `); // Registra que a sessão está pronta
      // Enable graceful stop
      process.once("SIGINT", () => tbot.stop("SIGINT")); // Habilita parada graciosa
      process.once("SIGTERM", () => tbot.stop("SIGTERM")); // Habilita parada graciosa
      resolve(tbot); // Retorna a sessão
    } catch (error) {
      connection.update({ // Atualiza o status da conexão em caso de erro
        status: "DISCONNECTED",
        qrcode: "",
        retries: 0
      });
      logger.error(`initWbot error | Error: ${error}`); // Registra erro no logger
      reject(new Error("Error starting telegram session.")); // Lança erro se a sessão não puder ser iniciada
    }
  });
};

// Função para obter a instância do bot do Telegram
export const getTbot = (whatsappId: number, checkState = true): Session => {
  logger.info(`whatsappId: ${whatsappId} | checkState: ${checkState}`); // Registra informações de verificação
  const sessionIndex = TelegramSessions.findIndex(s => s.id === whatsappId); // Verifica se a sessão existe

  return TelegramSessions[sessionIndex]; // Retorna a sessão correspondente
};

// Função para remover a instância do bot do Telegram
export const removeTbot = (whatsappId: number): void => {
  try {
    const sessionIndex = TelegramSessions.findIndex(s => s.id === whatsappId); // Verifica se a sessão existe
    const sessionSet: any = TelegramSessions[sessionIndex]; // Armazena a sessão
    if (sessionIndex !== -1) {
      // Enable graceful stop
      process.once("SIGINT", () => sessionSet.stop("SIGINT")); // Habilita parada graciosa
      process.once("SIGTERM", () => sessionSet.stop("SIGTERM")); // Habilita parada graciosa
      TelegramSessions.splice(sessionIndex, 1); // Remove a sessão da lista
    }
  } catch (err) {
    logger.error(`removeTbot | Error: ${err}`); // Registra erro no logger
  }
};
