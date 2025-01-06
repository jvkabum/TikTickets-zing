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
  apiId: string; // ID da API
  sessionId: number; // ID da sessão
  tenantId: number; // ID do inquilino
  iat: number; // Timestamp de quando o token foi emitido
  exp: number; // Timestamp de quando o token expira
}

// Middleware que verifica a autenticação da API
// Ele valida o token JWT específico para chamadas de API
const isAPIAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Busca o token de autorização do cabeçalho
  const authHeader = req.headers.authorization;

  // Verifica se o token existe, caso contrário retorna erro
  // Isso é necessário pois todas as rotas da API precisam de autenticação
  if (!authHeader) {
    throw new AppError("Token was not provided.", 403); // Lança um erro se o token não estiver presente
  }

  // Extrai o token do cabeçalho Bearer
  const [, token] = authHeader.split(" ");

  try {
    // Decodifica o token e extrai as informações da API
    const decoded = verify(token, authConfig.secret); // Verifica a validade do token usando a chave secreta
    const { apiId, sessionId, tenantId } = decoded as TokenPayload; // Desestrutura os dados do token

    // Anexa os dados da API à requisição para uso posterior
    // Isso permite que outras partes da aplicação acessem os dados da sessão da API
    req.APIAuth = {
      apiId,
      sessionId,
      tenantId
    };
  } catch (err) {
    // Se o token for inválido ou expirado, retorna erro
    throw new AppError("Invalid token.", 403); // Lança um erro se o token for inválido
  }

  // Se passou por todas as verificações, permite o acesso
  return next(); // Chama o próximo middleware
};

/**
 * O middleware isAPIAuth verifica a autenticação da API através de um token JWT.
 * Ele busca o token nos cabeçalhos da requisição e valida sua presença e integridade.
 * Se o token estiver ausente, lança um erro. Se o token for válido, os dados do
 * token (como apiId, sessionId e tenantId) são extraídos e anexados ao objeto de
 * requisição para uso posterior.
 */
export default isAPIAuth;
