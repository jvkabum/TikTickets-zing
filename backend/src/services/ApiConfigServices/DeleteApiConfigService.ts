import AppError from "../../errors/AppError";
import ApiConfig from "../../models/ApiConfig";

// Interface que define os parâmetros necessários para remoção
// Requer identificação da API e do tenant para segurança
interface Request {
  apiId: string | number;
  tenantId: string | number;
}

// Serviço responsável por remover uma configuração de API
// Verifica existência e permissões antes da remoção
const DeleteApiConfigService = async ({
  apiId,
  tenantId
}: Request): Promise<void> => {
  const api = await ApiConfig.findOne({
    where: { id: apiId, tenantId }
  });

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  await api.destroy();
};

export default DeleteApiConfigService;
