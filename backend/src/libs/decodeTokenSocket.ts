import { verify, JsonWebTokenError } from "jsonwebtoken"; 
import authConfig from "../config/auth"; 
import { logger } from "../utils/logger"; 

// ====================
// Definição das Interfaces
// ====================

interface TokenPayload {
  id: string; // ID do usuário
  username: string; // Nome de usuário
  profile: string; // Perfil do usuário
  tenantId: number; // ID do inquilino
  iat: number; // Timestamp de quando o token foi emitido
  exp: number; // Timestamp de quando o token expira
}

interface Data {
  id: number | string; // ID do usuário ou inquilino
  profile: string; // Perfil do usuário
  tenantId: number | string; // ID do inquilino
}

interface Result {
  isValid: boolean; // Indica se o token é válido
  data: Data; // Dados extraídos do token
}

// Função que decodifica o token JWT e valida
const decode = (token: string): Result => {
  const validation: Result = {
    isValid: false, // Inicializa como inválido
    data: {
      id: "", // Inicializa ID
      profile: "", // Inicializa perfil
      tenantId: 0 // Inicializa ID do inquilino
    }
  };

  // Verifica se o token é fornecido
  if (!token) {
    logger.error("JWT must be provided"); // Registra erro se o token não estiver presente
    return validation; // Retorna sem validar
  }

  try {
    // Decodifica o token e valida
    const decoded = verify(token, authConfig.secret) as TokenPayload; // Verifica a validade do token usando a chave secreta
    const { id, profile, tenantId } = decoded; // Extrai dados do token

    validation.isValid = true; // Marca como válido
    validation.data = {
      id,
      profile,
      tenantId,
    };
  } catch (err) {
    // Trata os erros de verificação do JWT
    if (err instanceof JsonWebTokenError) {
      logger.error(`JWT verification error: ${err.message}`); // Registra erro de verificação
    } else {
      logger.error(`Unexpected error: ${err}`); // Registra erro inesperado
    }
  }
  
  return validation; // Retorna o resultado da validação
};

export default decode; // Exporta a função decode para uso em outras partes da aplicação
