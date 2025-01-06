/* eslint-disable no-unused-vars */
import { verify } from "jsonwebtoken"; 
import { Request, Response, NextFunction } from "express"; 

import AppError from "../errors/AppError"; 
import authConfig from "../config/auth"; 

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

// Middleware que verifica a autenticação do usuário
// Ele valida o token JWT e extrai as informações do usuário
const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Busca o token de autorização do cabeçalho
  const authHeader = req.headers.authorization;

  // Verifica se o token existe, caso contrário retorna erro
  // Isso é necessário pois todas as rotas autenticadas precisam do token
  if (!authHeader) {
    throw new AppError("Token was not provided.", 403); // Lança um erro se o token não estiver presente
  }

  // Extrai o token do cabeçalho Bearer
  const [, token] = authHeader.split(" ");

  try {
    // Decodifica o token e extrai as informações do usuário
    const decoded = verify(token, authConfig.secret); // Verifica a validade do token usando a chave secreta
    const { id, profile, tenantId } = decoded as TokenPayload; // Desestrutura os dados do token

    // Anexa os dados do usuário à requisição para uso posterior
    // Isso permite que outras partes da aplicação acessem os dados do usuário
    req.user = {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    // Se o token for inválido ou expirado, retorna erro
    throw new AppError("Invalid token.", 403); // Lança um erro se o token for inválido
  }

  // Se passou por todas as verificações, permite o acesso
  return next(); // Chama o próximo middleware
};

export default isAuth; // Exporta o middleware para uso em outras partes da aplicação
