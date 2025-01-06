// import AppError from "../../errors/AppError";
import { sign } from "jsonwebtoken";
import ApiInstance from "../../models/ApiConfig";
import authConfig from "../../config/auth";
import AppError from "../../errors/AppError";

// Interface que define os parâmetros necessários para renovação do token
// Inclui identificadores da API, sessão, usuário e tenant
interface Request {
  apiId: string;
  sessionId: string | number;
  userId: string | number;
  tenantId: string | number;
}

// Serviço responsável por renovar o token de uma configuração de API
// Gera um novo token JWT com validade estendida
const RenewApiConfigTokenService = async ({
  apiId,
  sessionId,
  tenantId
}: Request): Promise<ApiInstance> => {
  const { secret } = authConfig;

  const api = await ApiInstance.findByPk(apiId);

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  const token = sign(
    {
      tenantId,
      profile: "admin",
      sessionId
    },
    secret,
    {
      expiresIn: "730d"
    }
  );

  api.update({ token });
  api.reload();

  return api;
};

export default RenewApiConfigTokenService;
