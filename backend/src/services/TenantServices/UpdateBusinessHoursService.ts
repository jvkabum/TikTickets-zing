import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

// Interface que define a estrutura de um dia de trabalho
// Contém informações sobre horários e tipo de operação
interface Day {
  day: string | number;
  label: string;
  type: string;
  hr1: string;
  hr2: string;
  hr3: string;
  hr4: string;
}

// Interface que define os parâmetros necessários para atualização
// Inclui novos horários e identificação do tenant
interface Request {
  businessHours: Day[];
  tenantId: number | string;
}

// Serviço responsável por atualizar horários comerciais do tenant
// Atualiza configurações de dias e horários de funcionamento
const UpdateBusinessHoursService = async ({
  businessHours,
  tenantId
}: Request): Promise<Tenant> => {
  const tenantModel = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenantModel) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  await tenantModel.update({
    businessHours
  });

  await tenantModel.reload({
    attributes: ["businessHours", "messageBusinessHours"]
  });

  return tenantModel;
};

export default UpdateBusinessHoursService;
