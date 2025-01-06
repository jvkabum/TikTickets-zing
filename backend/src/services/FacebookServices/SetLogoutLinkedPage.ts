import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";

// Interface que define os parâmetros necessários para desvinculação
// Requer o WhatsApp a ser desvinculado e o ID do tenant
interface Request {
  whatsapp: Whatsapp;
  tenantId: number | string;
}

// Serviço responsável por desvincular uma página do Facebook
// Remove todas as informações de conexão e atualiza o status
const SetLogoutLinkedPage = async ({
  whatsapp,
  tenantId
}: Request): Promise<void> => {
  const io = getIO();

  const dataUpdated = {
    fbPageId: null,
    fbObject: {},
    tokenAPI: null,
    status: "DISCONNECTED"
  };

  Whatsapp.update(dataUpdated, { where: { id: whatsapp.id, tenantId } });

  io.emit(`${tenantId}:whatsappSession`, {
    action: "update",
    session: { ...whatsapp, ...dataUpdated }
  });
};

export default SetLogoutLinkedPage;
