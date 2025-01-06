import { Request, Response } from "express"; 
import axios from "axios"; 
import AppError from "../errors/AppError"; 

import AuthUserService from "../services/UserServices/AuthUserService"; 
import { SendRefreshToken } from "../helpers/SendRefreshToken"; 
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService"; 
import { getIO } from "../libs/socket"; 
import User from "../models/User"; 

// ====================
// Função para armazenar uma nova sessão
// ====================
export const store = async (req: Request, res: Response): Promise<Response> => {
  const io = getIO(); // Obtém a instância do socket

  const { email, password } = req.body; // Extrai email e senha do corpo da requisição

  const { token, user, refreshToken, usuariosOnline } = await AuthUserService({
    email,
    password
  }); // Autentica o usuário e obtém os dados necessários

  SendRefreshToken(res, refreshToken); // Envia o token de atualização na resposta

  const params = {
    token, // Token de autenticação
    username: user.name, // Nome do usuário
    email: user.email, // Email do usuário
    profile: user.profile, // Perfil do usuário
    status: user.status, // Status do usuário
    userId: user.id, // ID do usuário
    tenantId: user.tenantId, // ID do inquilino
    queues: user.queues, // Filas do usuário
    usuariosOnline // Usuários online
  };

  io.emit(`${params.tenantId}:users`, { // Emite evento de atualização de usuários online
    action: "update",
    data: {
      username: params.username, // Nome do usuário
      email: params.email, // Email do usuário
      isOnline: true, // Indica que o usuário está online
      lastLogin: new Date() // Data do último login
    }
  });

  return res.status(200).json(params); // Retorna os dados em formato JSON
};

// ====================
// Função para atualizar a sessão
// ====================
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt; // Extrai o token de atualização dos cookies

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401); // Lança erro se o token não estiver presente
  }

  const { newToken, refreshToken } = await RefreshTokenService(token); // Atualiza o token

  SendRefreshToken(res, refreshToken); // Envia o novo token de atualização na resposta

  return res.json({ token: newToken }); // Retorna o novo token em formato JSON
};

// ====================
// Função para fazer logout
// ====================
export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.body; // Extrai o ID do usuário do corpo da requisição
  if (!userId) {
    throw new AppError("ERR_USER_NOT_FOUND", 404); // Lança erro se o ID do usuário não estiver presente
  }
  const io = getIO(); // Obtém a instância do socket

  const userLogout = await User.findByPk(userId); // Busca o usuário pelo ID

  if (userLogout) {
    userLogout.update({ isOnline: false, lastLogout: new Date() }); // Atualiza o status do usuário para offline
  }

  io.emit(`${userLogout?.tenantId}:users`, { // Emite evento de atualização de usuários online
    action: "update",
    data: {
      username: userLogout?.name, // Nome do usuário
      email: userLogout?.email, // Email do usuário
      isOnline: false, // Indica que o usuário está offline
      lastLogout: new Date() // Data do último logout
    }
  });

  // SendRefreshToken(res, refreshToken); // (Comentado, não utilizado)

  return res.json({ message: "USER_LOGOUT" }); // Retorna mensagem de sucesso
};
