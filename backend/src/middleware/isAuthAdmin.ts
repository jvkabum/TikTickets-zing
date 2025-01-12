import { verify } from "jsonwebtoken"; // Importa a função verify do jsonwebtoken para validar tokens.
import { Request, Response, NextFunction } from "express"; // Importa tipos para requisição, resposta e função next do Express.

import AppError from "../errors/AppError"; // Importa a classe de tratamento de erros personalizada.
import authConfig from "../config/auth"; // Importa a configuração de autenticação.
import User from "../models/User"; // Importa o modelo de Usuário para operações no banco de dados.

interface TokenPayload { // Define a estrutura do payload do token.
  id: string; // ID do usuário.
  username: string; // Nome de usuário.
  profile: string; // Tipo de perfil do usuário.
  tenantId: number; // ID do inquilino associado ao usuário.
  iat: number; // Timestamp de emissão.
  exp: number; // Timestamp de expiração.
}

// Função middleware para verificar se o usuário é um administrador.
const isAuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization; // Obtém o cabeçalho de autorização da requisição.
  const adminDomain = process.env.ADMIN_DOMAIN; // Obtém o domínio do administrador das variáveis de ambiente.

  // Verifica se o cabeçalho de autorização foi fornecido.
  if (!authHeader) {
    throw new AppError("Token não foi fornecido.", 403); // Lança um erro se nenhum token for fornecido.
  }
  // Verifica se o domínio do administrador está definido.
  if (!adminDomain) {
    throw new AppError("Não existem domínios de administrador definidos.", 403); // Lança um erro se nenhum domínio de administrador estiver definido.
  }

  const [, token] = authHeader.split(" "); // Extrai o token do cabeçalho de autorização.

  try {
    // Verifica o token usando o segredo da authConfig.
    const decoded = verify(token, authConfig.secret);
    const { id, profile, tenantId } = decoded as TokenPayload; // Desestrutura o payload do token decodificado.
    const user = await User.findByPk(id); // Encontra o usuário no banco de dados pelo ID.
    
    // Verifica se o usuário existe e se seu e-mail corresponde ao domínio do administrador.
    if (!user || user.email.indexOf(adminDomain) === 1) {
      throw new AppError("Sem permissão de administrador", 403); // Lança um erro se o usuário não for um administrador.
    }

    // Anexa informações do usuário ao objeto de requisição para uso posterior.
    req.user = {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    throw new AppError("Token inválido ou não é Administrador", 403); // Lança um erro se o token for inválido ou o usuário não for um administrador.
  }

  return next(); // Chama a próxima função middleware se o usuário estiver autenticado como administrador.
};

export default isAuthAdmin; // Exporta a função middleware isAuthAdmin.
