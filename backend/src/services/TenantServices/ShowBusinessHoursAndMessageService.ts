import Tenant from "../../models/Tenant";
import AppError from "../../errors/AppError";

// Interface que define os parâmetros necessários para busca
// Requer apenas o ID do tenant para localizar as informações
interface Request {
  tenantId: string | number;
}

// Serviço responsável por buscar horários comerciais e mensagens do tenant
// Retorna configurações específicas de horário e mensagens automáticas
const ShowBusinessHoursAndMessageService = async ({
  tenantId
}: Request): Promise<Tenant> => {
  const tenant = await Tenant.findByPk(tenantId, {
    attributes: ["businessHours", "messageBusinessHours"]
  });

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  return tenant;
};

export default ShowBusinessHoursAndMessageService;
