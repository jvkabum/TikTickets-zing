import CampaignContacts from "../../models/CampaignContacts";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

// Interface que define os parâmetros necessários para remoção
// Requer identificação da campanha e do tenant
// ====================
// Definição da Interface
// ====================

// Parâmetros necessários para remoção em massa
interface Request {
  campaignId: string | number;
  tenantId: number | string;
}

// Serviço responsável por remover todos os contatos de uma campanha
// Verifica permissões e executa remoção em massa
// ====================
// Serviço Principal
// ====================

// Remove todos os contatos de uma campanha específica
const DeleteAllCampaignContactsService = async ({
  campaignId,
  tenantId
}: Request): Promise<void> => {
  try {
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        tenantId
      }
    });

    if (campaign?.id) {
      await CampaignContacts.destroy({
        where: {
          campaignId
        }
      });
    } else {
      throw new AppError(
        "ERR_CAMPAIGN_CONTACTS_NOT_EXISTS_OR_NOT_ACESSIBLE",
        404
      );
    }
  } catch (error) {
    throw new AppError("ERR_CAMPAIGN_CONTACTS", 404);
  }
};

export default DeleteAllCampaignContactsService;
