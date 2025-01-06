import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

// Interface que define os parâmetros necessários para atualização
// Inclui nova mensagem e identificação do tenant
interface Request {
  messageBusinessHours: string;
  tenantId: number | string;
}

// Serviço responsável por atualizar a mensagem de horário comercial
// Atualiza o texto exibido quando contatos tentam interagir fora do horário
const UpdateMessageBusinessHoursService = async ({
  messageBusinessHours,
  tenantId
}: Request): Promise<Tenant> => {
  const tenantModel = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenantModel) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  await tenantModel.update({
    messageBusinessHours
  });

  await tenantModel.reload({
    attributes: ["businessHours", "messageBusinessHours"]
  });

  return tenantModel;
};

export default UpdateMessageBusinessHoursService;
