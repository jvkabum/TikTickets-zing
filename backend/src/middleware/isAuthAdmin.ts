/* eslint-disable no-unused-vars */
import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import User from "../models/User";

// ====================
// Definição da Interface
// ====================

// Interface que define a estrutura do payload do token
interface TokenPayload {
  id: string; // ID do usuário
  username: string; // Nome de usuário
  profile: string; // Perfil do usuário
  tenantId: number; // ID do inquilino
  iat: number; // Timestamp de quando o token foi emitido
  exp: number; // Timestamp de quando o token expira
}

// Middleware que verifica se o usuário tem permissões de administrador
// Ele valida o token JWT e verifica se o email do usuário pertence ao domínio admin
const isAuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Busca o token de autorização do cabeçalho
  const authHeader = req.headers.authorization;
  // Busca o domínio admin das variáveis de ambiente
  const adminDomain = process.env.ADMIN_DOMAIN;

  // Verifica se o token existe, caso contrário retorna erro
  // Isso é necessário pois todas as rotas admin precisam de autenticação
  if (!authHeader) {
    throw new AppError("Token was not provided.", 403); // Lança um erro se o token não estiver presente
  }

  // Verifica se existe um domínio admin configurado
  // Sem essa configuração não é possível validar permissões admin
  if (!adminDomain) {
    throw new AppError("Not exists admin domains defined.", 403); // Lança um erro se o domínio admin não estiver definido
  }

  // Extrai o token do cabeçalho Bearer
  const [, token] = authHeader.split(" ");

  try {
    // Decodifica o token e extrai as informações do usuário
    const decoded = verify(token, authConfig.secret); // Verifica a validade do token usando a chave secreta
    const { id, profile, tenantId } = decoded as TokenPayload; // Desestrutura os dados do token

    // Busca o usuário no banco de dados para verificar o email
    const user = await User.findByPk(id); // Busca o usuário pelo ID

    // Verifica se o usuário existe e se seu email pertence ao domínio admin
    // Caso contrário, significa que não tem permissão de administrador
    if (!user || user.email.indexOf(adminDomain) === -1) { // Corrigido para verificar se o domínio está presente
      throw new AppError("Not admin permission", 403); // Lança um erro se o usuário não for administrador
    }

    // Anexa os dados do usuário à requisição para uso posterior
    req.user = {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    throw new AppError("Invalid token or not Admin", 403); // Lança um erro se o token for inválido ou se não for administrador
  }

  // Se passou por todas as verificações, permite o acesso
  return next(); // Chama o próximo middleware
};

export default isAuthAdmin;