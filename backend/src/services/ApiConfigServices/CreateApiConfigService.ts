// import AppError from "../../errors/AppError";
import { sign } from "jsonwebtoken";
import ApiConfig from "../../models/ApiConfig";
import authConfig from "../../config/auth";

// Interface que define os dados necessários para criar uma configuração de API
// Inclui informações de conexão, URLs de webhook e identificadores
interface Request {
  name: string;
  sessionId: string | number;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  authToken?: string;
  userId: string | number;
  tenantId: string | number;
}

// Serviço responsável por criar uma nova configuração de API
// Gera token JWT e salva as configurações no banco de dados
const CreateApiConfigService = async ({
  name,
  sessionId,
  urlServiceStatus,
  urlMessageStatus,
  userId,
  authToken,
  tenantId
}: Request): Promise<ApiConfig> => {
  const { secret } = authConfig;

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

  const api = await ApiConfig.create({
    name,
    sessionId,
    token,
    authToken,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    tenantId
  });

  return api;
};

export default CreateApiConfigService;
