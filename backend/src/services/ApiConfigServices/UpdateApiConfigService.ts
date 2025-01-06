import AppError from "../../errors/AppError";
import ApiConfig from "../../models/ApiConfig";

// Interface que define os dados atualizáveis de uma configuração de API
// Inclui todas as propriedades que podem ser modificadas
interface ApiData {
  name: string;
  sessionId: string | number;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  userId: string | number;
  tenantId: string | number;
  authToken?: string;
  isActive?: boolean;
}

// Interface que define os parâmetros necessários para atualização
// Combina os novos dados com identificadores para localização
interface Request {
  apiData: ApiData;
  apiId: string;
  tenantId: string | number;
}

// Serviço responsável por atualizar uma configuração de API existente
// Verifica existência, atualiza dados e recarrega informações
const UpdateApiConfigService = async ({
  apiData,
  apiId,
  tenantId
}: Request): Promise<ApiConfig> => {
  const api = await ApiConfig.findOne({
    where: { id: apiId, tenantId }
  });

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  const {
    name,
    sessionId,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    authToken,
    isActive
  } = apiData;

  await api.update({
    name,
    sessionId,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    authToken,
    isActive
  });

  await api.reload();

  return api;
};

export default UpdateApiConfigService;
