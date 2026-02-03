import { context } from "@opentelemetry/api";
import * as Sentry from "@sentry/node";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import authConfig from "../config/auth";
import AppError from "../errors/AppError";
import { enrichActiveSpanWithContext, setTenantContext, setUserContext } from "../telemetry/propagation";

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

/**
 * Middleware que verifica a autenticação do usuário
 * Ele valida o token JWT e extrai as informações do usuário.
 * 
 * INTEGRAÇÃO OTEL: Injeta automaticamente tenant_id e user_id no Context API
 * para propagação em traces e logs.
 */
const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Busca o token de autorização do cabeçalho
  const authHeader = req.headers.authorization;

  // Verifica se o token existe, caso contrário retorna erro
  if (!authHeader) {
    throw new AppError("Token was not provided.", 403);
  }

  // Extrai o token do cabeçalho Bearer
  const [, token] = authHeader.split(" ");

  try {
    // Decodifica o token e extrai as informações do usuário
    const decoded = verify(token, authConfig.secret);
    const { id, profile, tenantId } = decoded as TokenPayload;

    // Anexa os dados do usuário à requisição
    req.user = {
      id,
      profile,
      tenantId
    };

    // --- INTEGRAÇÃO SENTRY ---
    Sentry.setUser({
      id,
      tenantId: String(tenantId),
      profile
    });

    // --- INTEGRAÇÃO OPENTELEMETRY ---
    // Cria um novo contexto com os dados do tenant e usuário
    let ctx = setTenantContext(tenantId);
    ctx = setUserContext(id, ctx);

    // Executa o resto da requisição dentro deste contexto
    return context.with(ctx, () => {
      enrichActiveSpanWithContext();
      next();
    });
    // --------------------------------
  } catch (err) {
    throw new AppError("Invalid token.", 403);
  }
};

export default isAuth; // Exporta o middleware para uso em outras partes da aplicação
