import { sign } from "jsonwebtoken";
import authConfig from "../config/auth";
import User from "../models/User";

// Função para criar o token de acesso (access token)
// @param user - Usuário para o qual o token será gerado
// @returns string - Token JWT assinado com as informações do usuário
export const createAccessToken = (user: User): string => {
  // Obtém configurações de segredo e tempo de expiração
  const { secret, expiresIn } = authConfig;

  // Cria e retorna o token JWT com informações do usuário
  return sign(
    {
      usarname: user.name,     // Nome do usuário
      tenantId: user.tenantId, // ID do tenant
      profile: user.profile,   // Perfil do usuário
      id: user.id             // ID do usuário
    },
    secret,                   // Chave secreta para assinatura
    {
      expiresIn              // Tempo de expiração do token
    }
  );
};

// Função para criar o token de atualização (refresh token)
// @param user - Usuário para o qual o token será gerado
// @returns string - Token JWT assinado para renovação
export const createRefreshToken = (user: User): string => {
  // Obtém configurações específicas para refresh token
  const { refreshSecret, refreshExpiresIn } = authConfig;

  // Cria e retorna o refresh token
  // Inclui apenas ID e versão do token para segurança
  return sign(
    { 
      id: user.id,                  // ID do usuário
      tokenVersion: user.tokenVersion // Versão do token para invalidação
    }, 
    refreshSecret,                  // Chave secreta específica para refresh
    {
      expiresIn: refreshExpiresIn   // Tempo de expiração mais longo
    }
  );
};
