/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  each,
  sortBy,
  fromPairs,
  map,
  forEach,
  isNull,
  findKey,
  isUndefined
} from "lodash";
import { Socket } from "socket.io";

// ====================
// Funções Utilitárias para Socket
// ====================

// Ordena as chaves de um objeto
export const sortByKeys = (obj: any) => {
  const keys = Object.keys(obj); // Obtém as chaves do objeto
  const sortedKeys = sortBy(keys); // Ordena as chaves
  return fromPairs(
    map(sortedKeys, key => {
      return [key, obj[key]]; // Retorna um novo objeto com as chaves ordenadas
    })
  );
};

// Envia uma mensagem para o próprio socket
export const sendToSelf = (socket: Socket, method: any, data: any = {}) => {
  socket.emit(method, data); // Emite a mensagem para o próprio socket
};

// Envia uma mensagem para o próprio socket usando o ID do socket
export const _sendToSelf = (
  io: { sockets: { sockets: any } },
  socketId: any,
  method: any,
  data: any
) => {
  each(io.sockets.sockets, socket => {
    if (socket.id === socketId) {
      socket.emit(method, data); // Emite a mensagem para o socket correspondente
    }
  });
};

// Envia uma mensagem para todos os clientes conectados
export const sendToAllConnectedClients = (
  socket: Socket,
  method: any,
  data: any
) => {
  socket.emit(method, data); // Emite a mensagem para todos os clientes conectados
};

// Envia uma mensagem para todos os clientes em uma sala específica
export const sendToAllClientsInRoom = (
  io: any,
  room: any,
  method: any,
  data: any
) => {
  io.sockets.in(room).emit(method, data); // Emite a mensagem para todos os clientes na sala
};

// Envia uma mensagem para um usuário específico
export const sendToUser = (
  socketList: any,
  userList: any,
  username: any,
  method: any,
  data: any
) => {
  let userOnline: any = null; // Inicializa a variável para armazenar o usuário online
  forEach(userList, (v, k) => {
    if (k.toLowerCase() === username.toLowerCase()) {
      userOnline = v; // Encontra o usuário online correspondente
      return true;
    }
  });

  if (isNull(userOnline)) return true; // Retorna se o usuário não estiver online

  forEach(userOnline?.sockets, socket => {
    const o = findKey(socketList, { id: socket }); // Encontra o socket correspondente
    if (o) {
      const i = o ? socketList[o] : null; // Obtém o socket da lista
      if (isUndefined(i)) return true; // Retorna se o socket não estiver definido
      i.emit(method, data); // Emite a mensagem para o socket
    }
  });
};

// Envia uma mensagem para todos os clientes, exceto um específico
export const sendToAllExcept = (
  io: any,
  exceptSocketId: any,
  method: any,
  data: any
) => {
  each(io.sockets.sockets, socket => {
    if (socket.id !== exceptSocketId) {
      socket.emit(method, data); // Emite a mensagem para todos os sockets, exceto o especificado
    }
  });
};

// Desconecta todos os clientes
export const disconnectAllClients = (io: any) => {
  Object.keys(io.sockets.sockets).forEach(sock => {
    io.sockets.sockets[sock].disconnect(true); // Desconecta cada socket
  });
};
