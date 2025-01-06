import { setMinutes, setHours, parseISO } from "date-fns";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";

// Função que extrai o nome do arquivo de uma URL
// Usada para obter o nome do arquivo de mídia da campanha
const cArquivoName = (url: string | undefined) => {
  if (!url) return "";
  const split = url.split("/");
  const name = split[split.length - 1];
  return name;
};
// Interface que define os dados atualizáveis de uma campanha
// Inclui todas as propriedades que podem ser modificadas
interface CampaignData {
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
}

// Interface que define os parâmetros necessários para atualização
// Combina dados da campanha com arquivos de mídia e identificadores
interface Request {
  campaignData: CampaignData;
  medias?: Express.Multer.File[];
  campaignId: string | number;
  tenantId: string | number;
}

// Serviço responsável por atualizar uma campanha existente
// Processa arquivos de mídia e atualiza dados no banco
const UpdateCampaignService = async ({
  campaignData,
  medias,
  campaignId,
  tenantId
}: Request): Promise<Campaign> => {
  let mediaData: Express.Multer.File | undefined;
  let data: any = {
    ...campaignData,
    mediaUrl: cArquivoName(campaignData.mediaUrl),
    start: setHours(setMinutes(parseISO(campaignData.start), 0), 8)
  };

  const campaignModel = await Campaign.findOne({
    where: { id: campaignId, tenantId }
  });

  if (
    campaignModel?.status !== "pending" &&
    campaignModel?.status !== "canceled"
  ) {
    throw new AppError("ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING", 404);
  }

  if (medias && Array.isArray(medias) && medias.length) {
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
    data = {
      ...campaignData,
      mediaUrl: mediaData?.filename,
      mediaType: mediaData?.mimetype.substr(0, mediaData.mimetype.indexOf("/"))
    };
  } else if (campaignData.mediaUrl === "null") {
    data = {
      ...campaignData,
      mediaUrl: "",
      mediaType: ""
    };
  }

  if (!campaignModel) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaignModel.update(data);

  await campaignModel.reload();

  return campaignModel;
};

export default UpdateCampaignService;
