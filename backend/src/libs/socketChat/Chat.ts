/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
import { Socket } from "socket.io";
import {
  find,
  findKey,
  forEach,
  fromPairs,
  isNull,
  size,
  sortBy,
  toPairs,
  without
} from "lodash";
import {
  sendToAllConnectedClients,
  sendToSelf,
  sendToUser,
  sortByKeys
} from "./Utils";
import { shared } from "./Index";
import User from "../../models/User";
import { logger } from "../../utils/logger";

// ====================
// Eventos do Chat
// ====================

const events: any = {};

// Função para gerenciar a entrada de um usuário no servidor de chat
const JoinChatServer = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  logger.info(`joinChatServer USER ${user.name}`); // Loga a entrada do usuário
  const { tenantId } = user; // Obtém o ID do inquilino
  const socketDataTenant = `socketData_${tenantId}`; // Cria uma chave para os dados do inquilino
  let dataTenant: any;

  // dataTenant = await getValue(socketDataTenant);
  dataTenant = shared[socketDataTenant]; // Obtém os dados do inquilino compartilhados
  if (dataTenant) {
    dataTenant.usersOnline[user.id] = {
      sockets: [socket.id], // Adiciona o socket do usuário
      user
    };
    dataTenant.sockets.push(socket); // Adiciona o socket à lista de sockets
    sendToSelf(socket, "joinSuccessfully"); // Envia uma mensagem de sucesso para o próprio socket
  }

  if (!dataTenant) {
    shared[socketDataTenant] = {
      sockets: [],
      usersOnline: {},
      idleUsers: {}
    }; // Inicializa os dados do inquilino se não existirem
    dataTenant = shared[socketDataTenant];
    dataTenant.usersOnline[user.id] = {
      sockets: [socket.id],
      user
    };
    dataTenant.sockets.push(socket);
    sendToSelf(socket, `${user.tenantId}:joinSuccessfully`); // Envia mensagem de sucesso com ID do inquilino
  }
};

// Atualiza a lista de usuários online
const UpdateUsers = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  const socketDataTenant = `socketData_${user.tenantId}`; // Cria uma chave para os dados do inquilino
  const dataTenant = shared[socketDataTenant]; // Obtém os dados do inquilino compartilhados

  const sortedUserList = sortByKeys(dataTenant.usersOnline); // Ordena a lista de usuários online
  forEach(sortedUserList, v => {
    const userValue = v.user; // Obtém o valor do usuário
    const { sockets } = v; // Obtém os sockets do usuário
    if (userValue && sockets.length > 0) {
      forEach(sockets, sock => {
        const socketFind = find(dataTenant.sockets, s => {
          return s.id === sock; // Encontra o socket correspondente
        });

        if (socketFind) {
          if (userValue.role.isAdmin || userValue.role.isAgent) {
            socketFind.emit("updateUsers", sortedUserList); // Atualiza a lista de usuários para administradores ou agentes
          }
        }
      });
    }
  });
};

// Atualiza as bolhas de chat online
const UpdateOnlineBubbles = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  const socketDataTenant = `socketData_${user.tenantId}`; // Cria uma chave para os dados do inquilino
  const dataTenant = shared[socketDataTenant]; // Obtém os dados do inquilino compartilhados
  const sortedUserList = fromPairs(
    sortBy(toPairs(dataTenant.usersOnline), o => {
      return o[0]; // Ordena a lista de usuários online
    })
  );
  const sortedIdleList = fromPairs(
    sortBy(toPairs(dataTenant.idleUsers), o => {
      return o[0]; // Ordena a lista de usuários ociosos
    })
  );

  sendToAllConnectedClients(
    socket,
    `${user.tenantId}:chat:updateOnlineBubbles`,
    {
      sortedUserList,
      sortedIdleList
    }
  ); // Envia a lista de usuários online e ociosos para todos os clientes conectados
};

// Cria uma nova janela de chat
const SpawnOpenChatWindows = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  const userSchema = User.findByPk(user.id); // Busca o usuário no banco de dados
  sendToSelf(socket, "spawnChatWindow", userSchema); // Envia a solicitação para abrir a janela de chat
};

// Função para gerenciar a criação de uma nova janela de chat
const spawnChatWindow = (socket: Socket) => {
  socket.on("spawnChatWindow", async (userId: number) => {
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "profile"] // Obtém os dados do usuário
    });
    sendToSelf(socket, "spawnChatWindow", user); // Envia a solicitação para abrir a janela de chat
  });
};

// Define o usuário como ocioso
const onSetUserIdle = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  const socketDataTenant = `socketData_${user.tenantId}`; // Cria uma chave para os dados do inquilino
  socket.on(`${user.tenantId}:setUserIdle`, () => {
    let dataTenant: any;
    dataTenant = shared[socketDataTenant]; // Obtém os dados do inquilino compartilhados
    if (dataTenant) {
      dataTenant.idleUsers[user.id] = {
        sockets: [socket.id], // Adiciona o socket à lista de usuários ociosos
        user
      };
    }
    if (!dataTenant) {
      shared[socketDataTenant] = {
        sockets: [],
        usersOnline: {},
        idleUsers: {}
      }; // Inicializa os dados do inquilino se não existirem
      dataTenant = shared[socketDataTenant];
      dataTenant.idleUsers.push(socket.id); // Adiciona o socket à lista de usuários ociosos
    }
    if (dataTenant?.usersOnline[user.id]) {
      delete dataTenant?.usersOnline[user.id]; // Remove o usuário da lista de usuários online
    }
    UpdateOnlineBubbles(socket); // Atualiza as bolhas de chat online
  });
};

// Define o usuário como ativo
const onSetUserActive = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  const socketDataTenant = `socketData_${user.tenantId}`; // Cria uma chave para os dados do inquilino

  socket.on(`${user.tenantId}:setUserActive`, () => {
    let dataTenant = shared[socketDataTenant];

    if (dataTenant?.idleUsers[user.id]) {
      delete dataTenant?.idleUsers[user.id];
    }

    if (!dataTenant) {
      shared[socketDataTenant] = {
        sockets: [],
        usersOnline: {},
        idleUsers: {}
      };
      dataTenant = shared[socketDataTenant];
      dataTenant.usersOnline.push(socket.id);
    }

    if (dataTenant?.usersOnline) {
      dataTenant.usersOnline[user.id] = {
        sockets: [socket.id],
        user
      };
    }

    UpdateOnlineBubbles(socket);
  });
};

const onUpdateUsers = (socket: Socket) => {
  socket.on("updateUsers", UpdateUsers);
};

const onChatMessage = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;
  socket.on("chatMessage", function (data) {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      const { from } = data;
      console.log("TO", to);
      console.log("FROM", from);
      const od = data.type;
      if (data.type === "s") {
        data.type = "r";
      } else {
        data.type = "s";
      }

      // buscar o usuario para chat (to)
      // Buscar o usuario de (from)
      // se error
      // // return utils.sendToSelf(socket, "chatMessage", { message: err });
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        data.toUser.username,
        "chatMessage",
        data
      );
      data.type = od;
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        data.fromUser.username,
        "chatMessage",
        data
      );
    }
  });
};

const onChatTyping = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;

  socket.on("chatTyping", data => {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      const { from } = data;

      let toUser: any = null;
      let fromUser: any = null;
      find(dataTenant.usersOnline, function (v) {
        if (String(v.user.id) === String(to)) {
          toUser = v.user;
        }

        if (String(v.user.id) === String(from)) {
          fromUser = v.user;
        }
      });

      if (isNull(toUser) || isNull(fromUser)) {
        return;
      }

      data.toUser = toUser;
      data.fromUser = fromUser;

      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        toUser.name,
        "chatTyping",
        data
      );
    }
  });
};

const onChatStopTyping = (socket: Socket) => {
  const { user } = socket.handshake.auth;
  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;
  socket.on("chatStopTyping", data => {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      let toUser: any = null;
      find(dataTenant.usersOnline, v => {
        if (String(v.user.id) === String(to)) {
          toUser = v.user;
        }
      });
      if (isNull(toUser)) {
        return;
      }
      data.toUser = toUser;
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        toUser.name,
        "chatStopTyping",
        data
      );
    }
  });
};

const saveChatWindow = (socket: Socket) => {
  socket.on("saveChatWindow", async data => {
    const { userId } = data;
    // const { convoId } = data;
    const { remove } = data;
    const userSchema = await User.findByPk(userId);
    if (userSchema) {
      if (remove) {
        // remover o chat do usuário
        // user.removeOpenChatWindow(convoId)
      } else {
        // adiciona o chat ao usuario
        // user.addOpenChatWindow(convoId)
      }
    }
  });
};

// Função para gerenciar a desconexão do socket
const onDisconnect = (socket: Socket) => {
  socket.on("disconnect", async reason => {
    const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

    const { tenantId } = user; // Obtém o ID do inquilino
    const socketDataTenant = `socketData_${tenantId}`; // Cria uma chave para os dados do inquilino
    const dataTenant = shared[socketDataTenant]; // Obtém os dados do inquilino compartilhados
    if (dataTenant?.usersOnline) {
      if (dataTenant.usersOnline[user.id]) {
        const userSockets = dataTenant.usersOnline[user.id].sockets; // Obtém os sockets do usuário
        if (size(userSockets) < 2) {
          delete dataTenant.usersOnline[user.id]; // Remove o usuário se não houver mais sockets
        } else {
          dataTenant.usersOnline[user.id].sockets = without(
            userSockets,
            socket.id // Remove o socket desconectado da lista
          );
        }
      }
      const o = findKey(dataTenant.sockets, { id: socket.id });
      dataTenant.sockets = without(dataTenant.sockets, o); // Remove o socket desconectado da lista de sockets
    }

    if (dataTenant?.idleUsers) {
      if (dataTenant.idleUsers[user.id]) {
        const idleSockets = dataTenant.idleUsers[user.id].sockets; // Obtém os sockets ociosos do usuário
        if (size(idleSockets) < 2) {
          delete dataTenant.idleUsers[user.id]; // Remove o usuário ocioso se não houver mais sockets
        } else {
          dataTenant.idleUsers[user.id].sockets = without(
            idleSockets,
            socket.id // Remove o socket desconectado da lista de ociosos
          );
        }
      }
      const i = findKey(dataTenant.sockets, { id: socket.id });
      dataTenant.sockets = without(dataTenant.sockets, i); // Remove o socket desconectado da lista de sockets
    }

    // Salva o horário da última desconexão
    const instance = await User.findByPk(user.id);
    instance?.update({ status: "offline", lastOnline: new Date() }); // Atualiza o status do usuário para offline
    UpdateOnlineBubbles(socket); // Atualiza as bolhas de chat online

    if (reason === "transport error") {
      reason = "client terminated"; // Altera a razão da desconexão se for um erro de transporte
    }
    logger.debug(`User disconnected (${reason}): ${user.name} - ${socket.id}`); // Loga a desconexão do usuário
  });
};

// Registra os eventos do chat
events.onSetUserIdle = onSetUserIdle;
events.onSetUserActive = onSetUserActive;
events.onUpdateUsers = onUpdateUsers;
events.spawnChatWindow = spawnChatWindow;
events.onChatMessage = onChatMessage;
events.onChatTyping = onChatTyping;
events.onChatStopTyping = onChatStopTyping;
events.saveChatWindow = saveChatWindow;
events.onDisconnect = onDisconnect;
events.updateOnlineBubbles = (socket: Socket) => {
  const { user } = socket.handshake.auth; // Obtém o usuário da autenticação do socket

  socket.on(`${user.tenantId}:chat:updateOnlineBubbles`, () => {
    UpdateOnlineBubbles(user.tenantId); // Atualiza as bolhas de chat online
  });
};
events.getOpenChatWindows = (socket: Socket) => {
  socket.on("getOpenChatWindows", () => {
    SpawnOpenChatWindows(socket); // Solicita a abertura de janelas de chat
  });
};

// Função para registrar eventos do socket
function register(socket: Socket): void {
  if (!socket.handshake?.auth?.tenantId) {
    return; // Retorna se não houver ID do inquilino
  }

  events.onSetUserIdle(socket); // Registra evento de usuário ocioso
  events.onSetUserActive(socket); // Registra evento de usuário ativo
  events.onUpdateUsers(socket); // Registra evento de atualização de usuários
  events.updateOnlineBubbles(socket); // Registra evento de atualização de bolhas online
  events.spawnChatWindow(socket); // Registra evento de abertura de janela de chat
  events.getOpenChatWindows(socket); // Registra evento de obtenção de janelas de chat abertas
  events.onChatMessage(socket); // Registra evento de mensagem de chat
  events.onChatTyping(socket); // Registra evento de digitação no chat
  events.onChatStopTyping(socket); // Registra evento de parar de digitar no chat
  events.saveChatWindow(socket); // Registra evento de salvar janela de chat
  events.onDisconnect(socket); // Registra evento de desconexão do socket

  if (socket.handshake.auth.user.id) {
    JoinChatServer(socket); // Chama a função para gerenciar a entrada do usuário no servidor de chat
  }
}

// Função para gerenciar o loop de eventos do chat
const eventLoop = (socket: Socket) => {
  UpdateUsers(socket); // Atualiza a lista de usuários
  UpdateOnlineBubbles(socket); // Atualiza as bolhas de chat online
};

// Exporta os eventos e funções do chat
const chat = {
  events,
  eventLoop,
  register
};

export default chat; // Exporta o módulo de chat
