/* eslint-disable camelcase */
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient
  // IgLoginTwoFactorRequiredError
} from "instagram-private-api"; 
import { IgApiClientMQTT, withFbnsAndRealtime } from "instagram_mqtt"; 
import AppError from "../errors/AppError"; 
import Whatsapp from "../models/Whatsapp"; 
// import { getIO } from "./socket"; // Importa a função para obter a instância do socket (comentado, não utilizado)
import { logger } from "../utils/logger";

// ====================
// Definição da Interface
// ====================

interface Session extends IgApiClientMQTT {
  id: number; // ID da sessão
  accountLogin?: 
  | AccountRepositoryLoginResponseLogged_in_user 
  | AccountRepositoryCurrentUserResponseUser; // Informações do usuário logado
}

// Armazena as sessões ativas
const sessions: Session[] = [];

// Função para inicializar o bot do Instagram
export const initInstaBot = async (connection: Whatsapp): Promise<Session> => {
  try {
    // const io = getIO(); // Obtém a instância do socket (comentado, não utilizado)
    let sessionCfg; // Variável para armazenar a configuração da sessão
    let loggedUser; // Variável para armazenar o usuário logado
    const username = `@${connection.instagramUser}`; // Extrai o nome de usuário do objeto de conexão
    const password = connection.instagramKey; // Extrai a chave do Instagram do objeto de conexão
    // const password = ""; // (Comentado, não utilizado)
    if (!username || !password) {
      throw new Error("Not credentials"); // Lança erro se as credenciais não estiverem presentes
    }

    if (connection && connection.session) {
      sessionCfg = JSON.parse(connection.session); // Carrega a configuração da sessão se existir
    }

    // se não funcionar, necessário adequar o "as"
    const ig = withFbnsAndRealtime(new IgApiClient()) as Session; // Cria uma nova instância do cliente do Instagram
    ig.id = connection.id; // Atribui o ID da conexão à sessão

    ig.state.generateDevice(username); // Gera um dispositivo para a sessão

    if (connection.session) {
      const { accountLogin } = ig; // Armazena informações do login
      await ig.importState(JSON.parse(connection.session)); // Importa o estado da sessão
      ig.accountLogin = accountLogin; // Restaura informações do login
    } else {
      // await ig.simulate.preLoginFlow(); // (Comentado, não utilizado)
      loggedUser = await ig.account.login(username, password); // Realiza o login no Instagram
      ig.accountLogin = loggedUser; // Armazena informações do usuário logado
      process.nextTick(async () => {
        await ig.simulate.postLoginFlow(); // Simula o fluxo pós-login
      });
      sessionCfg = await ig.exportState(); // Exporta o estado da sessão
      await connection.update({
        session: sessionCfg // Atualiza a conexão com a nova configuração da sessão
      });
    }

    await ig.realtime.connect({
      irisData: await ig.feed.directInbox().request() // Conecta ao serviço de tempo real
    });
    // PartialObserver<FbnsNotificationUnknown>
    // ig.fbns.push$.subscribe((data: any) => { // (Comentado, não utilizado)

    await ig.fbns.connect({
      autoReconnect: true // Conecta ao serviço de FBNS com reconexão automática
    });

    const sessionIndex = sessions.findIndex(s => s.id === connection.id); // Verifica se a sessão já existe
    if (sessionIndex === -1) {
      ig.id = connection.id; // Atribui o ID da conexão à sessão
      if (!ig.accountLogin) {
        ig.accountLogin = await ig.account.currentUser(); // Obtém informações do usuário atual
      }
      sessions.push(ig); // Adiciona a nova sessão à lista de sessões
    } else {
      ig.id = connection.id; // Atribui o ID da conexão à sessão
      if (!ig.accountLogin) {
        ig.accountLogin = await ig.account.currentUser(); // Obtém informações do usuário atual
      }
      sessions[sessionIndex] = ig; // Atualiza a sessão existente
    }

    return ig; // Retorna a sessão
  } catch (err) {
    logger.error(`initWbot error | Error: ${err}`); // Registra erro no logger
    throw new AppError(`${err}`, 404); // Lança erro se ocorrer um problema
    // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.'
  }
};

// Função para obter a instância do bot do Instagram
export const getInstaBot = (channelId: number): Session => {
  // logger.info(`channelId: ${ channelId } | checkState: ${ checkState }`); // (Comentado, não utilizado)
  const sessionIndex = sessions.findIndex(s => s.id === channelId); // Verifica se a sessão existe

  return sessions[sessionIndex]; // Retorna a sessão correspondente
};

// Função para remover a instância do bot do Instagram
export const removeInstaBot = (connection: Whatsapp): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === connection.id); // Verifica se a sessão existe
    if (sessionIndex !== -1) {
      sessions[sessionIndex].account.logout(); // Faz logout da conta
      sessions[sessionIndex].realtime.disconnect(); // Desconecta do serviço de tempo real
      sessions[sessionIndex].fbns.disconnect(); // Desconecta do serviço FBNS
      sessions.splice(sessionIndex, 1); // Remove a sessão da lista
    }
    connection.update({
      session: "" // Limpa a sessão na conexão
    });
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`); // Registra erro no logger
  }
};
