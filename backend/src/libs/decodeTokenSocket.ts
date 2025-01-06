import { verify, JsonWebTokenError } from "jsonwebtoken";
import authConfig from "../config/auth";
import { logger } from "../utils/logger";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  tenantId: number;
  iat: number;
  exp: number;
}

interface Data {
  id: number | string;
  profile: string;
  tenantId: number | string;
}

interface Result {
  isValid: boolean;
  data: Data;
}

const decode = (token: string): Result => {
  const validation: Result = {
    isValid: false,
    data: {
      id: "",
      profile: "",
      tenantId: 0
    }
  };

  // Verifica se o token é fornecido
  if (!token) {
    logger.error("JWT must be provided");
    return validation; // Retorna sem validar
  }

  try {
    // Decodifica o token e valida
    const decoded = verify(token, authConfig.secret) as TokenPayload;
    const { id, profile, tenantId } = decoded;

    validation.isValid = true;
    validation.data = {
      id,
      profile,
      tenantId,
    };
  } catch (err) {
    // Trata os erros de verificação do JWT
    if (err instanceof JsonWebTokenError) {
      logger.error(`JWT verification error: ${err.message}`);
    } else {
      logger.error(`Unexpected error: ${err}`);
    }
  }
  
  return validation;
};

export default decode;