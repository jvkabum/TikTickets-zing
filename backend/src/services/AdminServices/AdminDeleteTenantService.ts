import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";
import ApiConfig from "../../models/ApiConfig";
import ApiMessage from "../../models/ApiMessage";
import AutoReply from "../../models/AutoReply";
import Campaigns from "../../models/Campaign";
import ChatFlow from "../../models/ChatFlow";
import ContactTags from "../../models/ContactTag";
import ContactWallets from "../../models/ContactWallet";
import Contacts from "../../models/Contact";
import FastReply from "../../models/FastReply";
import Messages from "../../models/Message";
import Queues from "../../models/Queue";
import Settings from "../../models/Setting";
import Tags from "../../models/Tag";
import Tickets from "../../models/Ticket";
import Users from "../../models/User";
import Whatsapps from "../../models/Whatsapp";
// Importe todos os outros modelos aqui

interface Request {
  tenantId: string | number;
}

const AdminDeleteTenantService = async ({
  tenantId
}: Request): Promise<void> => {
  const tenant = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  // Deletar dados em todas as tabelas
  await ApiConfig.destroy({ where: { tenantId } });
  await ApiMessage.destroy({ where: { tenantId } });
  await AutoReply.destroy({ where: { tenantId } });
  await Campaigns.destroy({ where: { tenantId } });
  await ChatFlow.destroy({ where: { tenantId } });
  await ContactTags.destroy({ where: { tenantId } });
  await ContactWallets.destroy({ where: { tenantId } });
  await Contacts.destroy({ where: { tenantId } });
  await FastReply.destroy({ where: { tenantId } });
  await Messages.destroy({ where: { tenantId } });
  await Queues.destroy({ where: { tenantId } });
  await Settings.destroy({ where: { tenantId } });
  await Tags.destroy({ where: { tenantId } });
  await Tickets.destroy({ where: { tenantId } });
  await Users.destroy({ where: { tenantId } });
  await Whatsapps.destroy({ where: { tenantId } });
  // Chame o método destroy para todos os outros modelos aqui

  // Finalmente, deletar o inquilino
  await tenant.destroy();
};

export default AdminDeleteTenantService;
