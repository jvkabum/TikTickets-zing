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
  mediaUrl2?: string;
  mediaType2?: string;
  mediaUrl3?: string;
  mediaType3?: string;
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
  const mediaData: (Express.Multer.File | undefined)[] = [undefined, undefined, undefined];

  if (medias && Array.isArray(medias)) {
    medias.forEach((media, index) => {
      if (index < 3) {
        if (!media.filename) {
          const ext = media.mimetype.split("/")[1].split(";")[0];
          media.filename = `${new Date().getTime()}_${index}.${ext}`;
        }
        mediaData[index] = media;
      }
    });
  }

  const data: any = {
    name: campaign.name,
    start: parseISO(campaign.start),
    message1: campaign.message1,
    message2: campaign.message2,
    message3: campaign.message3,
    userId: campaign.userId,
    delay: campaign.delay,
    mediaUrl: mediaData[0]?.filename || campaign.mediaUrl,
    mediaType: mediaData[0]?.mimetype.split("/")[0] || campaign.mediaType,
    mediaUrl2: mediaData[1]?.filename || campaign.mediaUrl2,
    mediaType2: mediaData[1]?.mimetype.split("/")[0] || campaign.mediaType2,
    mediaUrl3: mediaData[2]?.filename || campaign.mediaUrl3,
    mediaType3: mediaData[2]?.mimetype.split("/")[0] || campaign.mediaType3,
    sessionId: campaign.sessionId,
    tenantId: campaign.tenantId
  };
  const campaignData = await Campaign.create(data);

  return campaignData;
};

export default CreateCampaignService;
