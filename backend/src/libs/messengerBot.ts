/* eslint-disable eqeqeq */
import { MessengerClient } from "messaging-api-messenger"; 
import process from "process"; 
import AppError from "../errors/AppError"; 
import Whatsapp from "../models/Whatsapp"; 
import { logger } from "../utils/logger"; 

// ====================
// Definição da Interface
// ====================

interface Session extends MessengerClient {
  id: number; // ID da sessão
}

// Armazena as sessões ativas do Messenger
const sessionsMessenger: Session[] = [];

// Função para inicializar o bot do Messenger
export const initMessengerBot = async (
  connection: Whatsapp
): Promise<Session> => {
  try {
    // const io = getIO(); // Obtém a instância do socket (comentado, não utilizado)

    const accessToken = connection.tokenAPI; // Extrai o token de acesso da conexão
    const appId = process.env.VUE_FACEBOOK_APP_ID; // Obtém o ID do aplicativo do Facebook das variáveis de ambiente
    // const appSecret = "3266b8c98ac59f3e957a5efeaaa13500"; // (Comentado, não utilizado)
    // const password = ""; // (Comentado, não utilizado)
    if (!accessToken) {
      throw new Error("Not token configured"); // Lança erro se o token não estiver configurado
    }

    // if (connection && connection.session) {
    //   sessionCfg = JSON.parse(connection.session); // (Comentado, não utilizado)
    // }

    const messengerClient = new MessengerClient({
      accessToken,
      appId
      // appSecret // (Comentado, não utilizado)
      // version: '6.0', // (Comentado, não utilizado)
    }) as Session; // Cria uma nova instância do cliente do Messenger

    messengerClient.id = connection.id; // Atribui o ID da conexão à sessão

    const sessionIndex = sessionsMessenger.findIndex(
      s => s.id === connection.id // Verifica se a sessão já existe
    );
    if (sessionIndex === -1) {
      messengerClient.id = connection.id; // Atribui o ID da conexão à sessão
      sessionsMessenger.push(messengerClient); // Adiciona a nova sessão à lista de sessões
    } else {
      messengerClient.id = connection.id; // Atribui o ID da conexão à sessão
      sessionsMessenger[sessionIndex] = messengerClient; // Atualiza a sessão existente
    }

    return messengerClient; // Retorna a sessão
  } catch (err) {
    logger.error(`initMessengerBot error | Error: ${err}`); // Registra erro no logger
    throw new AppError(`${err}`, 404); // Lança erro se ocorrer um problema
    // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.' // (Comentado, não utilizado)
  }
};

// Função para obter a instância do bot do Messenger
export const getMessengerBot = (channelId: number | string): Session => {
  // logger.info(`channelId: ${ channelId } | checkState: ${ checkState }`); // (Comentado, não utilizado)
  const sessionIndex = sessionsMessenger.findIndex(s => s.id == channelId); // Verifica se a sessão existe

  return sessionsMessenger[sessionIndex]; // Retorna a sessão correspondente
};
