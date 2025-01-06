/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Server as SocketIO } from "socket.io"; 
import socketRedis from "socket.io-redis"; 
import { Server } from "http"; 
import AppError from "../errors/AppError"; 
import decodeTokenSocket from "./decodeTokenSocket"; 
import { logger } from "../utils/logger"; 
import User from "../models/User"; 
import Chat from "./socketChat/Chat"; 

let io: SocketIO; // Declara a variável io para armazenar a instância do SocketIO

// ====================
// Função para inicializar o SocketIO
// ====================
export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, { // Cria uma nova instância do SocketIO
    cors: {
      origin: "*" // Permite requisições de qualquer origem
    },
    pingTimeout: 180000, // Tempo limite para pings
    pingInterval: 60000 // Intervalo entre pings
  });

  const connRedis = { // Configurações de conexão com o Redis
    host: process.env.IO_REDIS_SERVER, // Host do servidor Redis
    port: Number(process.env.IO_REDIS_PORT), // Porta do servidor Redis
    username: process.env.IO_REDIS_USERNAME, // Nome de usuário do Redis
    password: process.env.IO_REDIS_PASSWORD // Senha do Redis
  };

  const redis = socketRedis as any; // Declara a variável redis como tipo any
  io.adapter(redis(connRedis)); // Configura o adaptador Redis para o SocketIO

  io.use(async (socket, next) => { // Middleware para autenticação de sockets
    try {
      const token = socket?.handshake?.auth?.token; // Extrai o token da autenticação do socket
      const verify = decodeTokenSocket(token); // Decodifica o token
      if (verify.isValid) { // Verifica se o token é válido
        const auth = socket?.handshake?.auth; // Extrai informações de autenticação
        socket.handshake.auth = {
          ...auth,
          ...verify.data,
          id: String(verify.data.id), // Converte o ID para string
          tenantId: String(verify.data.tenantId) // Converte o ID do inquilino para string
        };

        const user = await User.findByPk(verify.data.id, { // Busca o usuário pelo ID
          attributes: [
            "id",
            "tenantId",
            "name",
            "email",
            "profile",
            "status",
            "lastLogin",
            "lastOnline"
          ]
        });
        socket.handshake.auth.user = user; // Adiciona o usuário autenticado ao handshake
        next(); // Chama o próximo middleware
      }
      next(new Error("authentication error")); // Lança erro se a autenticação falhar
    } catch (error) {
      logger.warn(`tokenInvalid: ${socket}`); // Registra aviso no logger
      socket.emit(`tokenInvalid:${socket.id}`); // Emite evento de token inválido
      next(new Error("authentication error")); // Lança erro se a autenticação falhar
    }
  });

  io.on("connection", socket => { // Evento de conexão do socket
    const { tenantId } = socket.handshake.auth; // Extrai o ID do inquilino do handshake
    if (tenantId) {
      logger.info({ // Registra informações de conexão no logger
        message: "Client connected in tenant",
        data: socket.handshake.auth
      });

      // create room to tenant
      socket.join(tenantId.toString()); // Adiciona o socket à sala do inquilino

      socket.on(`${tenantId}:joinChatBox`, ticketId => { // Evento para entrar na sala de chat
        logger.info(`Client joined a ticket channel ${tenantId}:${ticketId}`); // Registra no logger
        socket.join(`${tenantId}:${ticketId}`); // Adiciona o socket à sala do ticket
      });

      socket.on(`${tenantId}:joinNotification`, () => { // Evento para entrar na sala de notificações
        logger.info(`A client joined notification channel ${tenantId}:notification`); // Registra no logger
        socket.join(`${tenantId}:notification`); // Adiciona o socket à sala de notificações
      });

      socket.on(`${tenantId}:joinTickets`, status => { // Evento para entrar na sala de tickets
        logger.info(`A client joined to ${tenantId}:${status} tickets channel.`); // Registra no logger
        socket.join(`${tenantId}:${status}`); // Adiciona o socket à sala de tickets
      });
      Chat.register(socket); // Registra o socket no módulo de chat
    }

    socket.on("disconnect", (reason: any) => { // Evento de desconexão do socket
      logger.info({ // Registra informações de desconexão no logger
        message: `SOCKET Client disconnected , ${tenantId}, ${reason}`
      });
    });
  });
  return io; // Retorna a instância do SocketIO
};

// Função para obter a instância do SocketIO
export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized"); // Lança erro se o SocketIO não estiver inicializado
  }
  return io; // Retorna a instância do SocketIO
};
