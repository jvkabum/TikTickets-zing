import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";

// Interface que define os parâmetros necessários para exclusão
// Requer identificação da campanha e do tenant
interface Request {
  id: string;
  tenantId: number | string;
}

// Serviço responsável por excluir uma campanha do sistema
// Verifica status e permissões antes da exclusão
const DeleteCampaignService = async ({
  id,
  tenantId
}: Request): Promise<void> => {
  const campaign = await Campaign.findOne({
    where: { id, tenantId }
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  if (campaign?.status !== "pending" && campaign?.status !== "canceled") {
    throw new AppError("ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING", 404);
  }

  try {
    await campaign.destroy();
  } catch (error) {
    throw new AppError("ERROR_CAMPAIGN_NOT_EXISTS", 404);
  }
};

export default DeleteCampaignService;
