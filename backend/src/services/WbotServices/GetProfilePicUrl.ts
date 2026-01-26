import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const GetProfilePicUrl = async (
  number: string,
  tenantId: string | number
): Promise<string> => {
  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
    const wbot = getWbot(defaultWhatsapp.id);
    const profilePicId = number.includes('@') ? number : `${number}@c.us`;
    const profilePicUrl = await wbot.getProfilePicUrl(profilePicId);
    return profilePicUrl;
  } catch (error) {
    logger.error(`GetProfilePicUrl - ${error}`);
    return "";
  }
};

export default GetProfilePicUrl;
