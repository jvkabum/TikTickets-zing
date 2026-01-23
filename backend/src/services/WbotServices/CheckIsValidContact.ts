import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot, getActiveWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const CheckIsValidContact = async (
  number: string,
  tenantId: string | number
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);

  // getActiveWbot tenta reconectar se a sessão estiver offline em memória
  const wbot = await getActiveWbot(defaultWhatsapp.id);

  try {
    const idNumber = await wbot.getNumberId(number);
    if (!idNumber) {
      throw new Error("invalidNumber");
    }
    return idNumber;
  } catch (err: any) {
    logger.error(`CheckIsValidContact | Error: ${err}`);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
