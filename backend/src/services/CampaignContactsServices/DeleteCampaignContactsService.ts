import CampaignContacts from "../../models/CampaignContacts";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

// Interface que define os parâmetros necessários para remoção
// Requer identificação da campanha, contato e tenant
interface Request {
  campaignId: string | number;
  contactId: string | number;
  tenantId: number | string;
}

// Serviço responsável por remover um contato específico de uma campanha
// Verifica existência e permissões antes da remoção
const DeleteCampaignContactsService = async ({
  campaignId,
  contactId,
  tenantId
}: Request): Promise<void> => {
  const cc = await CampaignContacts.findOne({
    where: { campaignId, contactId },
    include: [
      {
        model: Campaign,
        required: true,
        where: {
          id: campaignId,
          tenantId
        }
      }
    ]
  });

  if (!cc) {
    throw new AppError("ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND", 404);
  }
  try {
    await cc.destroy();
  } catch (error) {
    throw new AppError("ERR_CAMPAIGN_CONTACTS_NOT_EXISTS", 404);
  }
};

export default DeleteCampaignContactsService;
