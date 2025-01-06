// import AppError from "../../errors/AppError";
import { parseISO, setHours, setMinutes } from "date-fns";
import { logger } from "../../utils/logger";

import Campaign from "../../models/Campaign";

// Interface que define os dados necessários para criar uma campanha
// Inclui informações sobre mensagens, agendamento e mídia
interface CampaignRequest {
  name: string;
  start: string;
  message1: string;
  message2: string;
  message3: string;
  mediaUrl?: string;
  mediaType?: string;
  userId: string;
  delay: string;
  sessionId: string;
  tenantId: string;
}

// Interface que combina dados da campanha com arquivos de mídia
// Permite envio de arquivos junto com as informações da campanha
interface Request {
  campaign: CampaignRequest;
  medias?: Express.Multer.File[];
}

// Serviço responsável por criar uma nova campanha
// Processa arquivos de mídia e salva dados no banco
const CreateCampaignService = async ({
  campaign,
  medias
}: Request): Promise<Campaign> => {
  let mediaData: Express.Multer.File | undefined;
  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        try {
          if (!media.filename) {
            const ext = media.mimetype.split("/")[1].split(";")[0];
            media.filename = `${new Date().getTime()}.${ext}`;
          }
          mediaData = media;
        } catch (err) {
          logger.error(err);
        }
      })
    );
  }
  const data: any = {
    name: campaign.name,
    start: parseISO(campaign.start),
    message1: campaign.message1,
    message2: campaign.message2,
    message3: campaign.message3,
    userId: campaign.userId,
    delay: campaign.delay,
    mediaUrl: mediaData?.filename,
    mediaType: mediaData?.mimetype.substr(0, mediaData.mimetype.indexOf("/")),
    sessionId: campaign.sessionId,
    tenantId: campaign.tenantId
  };
  const campaignData = await Campaign.create(data);

  return campaignData;
};

export default CreateCampaignService;
