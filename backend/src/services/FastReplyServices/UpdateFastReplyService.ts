import AppError from "../../errors/AppError";
import FastReply from "../../models/FastReply";

interface FastReplyData {
  key: string;
  message: string;
  userId: number;
  tenantId: number | string;
  medias?: string[]; // Caminhos dos arquivos no servidor
}

interface Request {
  fastReplyData: FastReplyData;
  fastReplyId: string;
}

const UpdateFastReplyService = async ({
                                        fastReplyData,
                                        fastReplyId
                                      }: Request): Promise<FastReply> => {
  const { key, message, userId, tenantId, medias } = fastReplyData;

  // Busca a resposta rápida no banco de dados diretamente no modelo FastReply
  const fastReplyModel = await FastReply.findOne({
    where: { id: fastReplyId, tenantId },
    attributes: ["id", "key", "message", "userId", "medias"] // Incluindo medias
  });

  if (!fastReplyModel) {
    throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
  }

  // Se não houver novas mídias enviadas, mantenha as mídias existentes
  const updatedMedias = medias && medias.length > 0 ? medias : fastReplyModel.medias;

  // Atualiza o registro com os novos dados, incluindo mídias (ou mantendo as existentes)
  await fastReplyModel.update({
    key,
    message,
    userId,
    medias: updatedMedias // Atualiza ou mantém as mídias existentes
  });

  // Recarga o modelo com os dados atualizados
  await fastReplyModel.reload({
    attributes: ["id", "key", "message", "userId", "medias"] // Incluindo medias
  });

  return fastReplyModel;
};

export default UpdateFastReplyService;
