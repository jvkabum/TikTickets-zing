import CampaignContacts from "../../models/CampaignContacts";
import Contact from "../../models/Contact";

// ====================
// Definição da Interface
// ====================

// Parâmetros necessários para listar contatos de uma campanha
interface Request {
  tenantId: string | number;    // Filtra contatos por tenant
  campaignId: string | number;  // Identifica a campanha específica
}

// ====================
// Serviço Principal
// ====================

// Lista todos os contatos associados a uma campanha específica
const ListCampaignContactsService = async ({
  campaignId,
  tenantId
}: Request): Promise<Contact[]> => {
  const contactsData = await Contact.findAll({
    where: {
      tenantId
    },
    include: [
      {
        model: CampaignContacts,
        as: "campaignContacts",
        where: { campaignId },
        required: true
      }
    ],
    order: [["name", "ASC"]]
    // logging: console.log
  });

  return contactsData;
};

export default ListCampaignContactsService;
