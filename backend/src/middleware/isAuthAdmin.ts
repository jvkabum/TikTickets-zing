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
    id: string;
    username: string;
    profile: string;
    tenantId: number;
    iat: number;
    exp: number;
  }
  
// Middleware que verifica se o usuário tem permissões de administrador
// Ele valida o token JWT e verifica se o email do usuário pertence ao domínio admin
  const isAuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const adminDomain = process.env.ADMIN_DOMAIN;
  
    if (!authHeader) {
      throw new AppError("Token was not provided.", 403);
    }
    if (!adminDomain) {
      throw new AppError("Not exists admin domains defined.", 403);
    }
  
    const [, token] = authHeader.split(" ");
  
    try {
      const decoded = verify(token, authConfig.secret);
      const { id, profile, tenantId } = decoded as TokenPayload;
      const user = await User.findByPk(id);
      if (!user || user.email.indexOf(adminDomain) === 1) {
        throw new AppError("Not admin permission", 403);
      }
  
      req.user = {
        id,
        profile,
        tenantId
      };
    } catch (err) {
      throw new AppError("Invalid token or not Admin", 403);
    }
  
    return next();
  };
  
  export default isAuthAdmin;
