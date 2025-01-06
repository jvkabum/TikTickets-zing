import AppError from "../../errors/AppError";
import FastReply from "../../models/FastReply";

interface DeleteFastReplyImageRequest {
  fastReplyId: string | number;
}

const DeleteFastReplyImageService = async ({
  fastReplyId
}: DeleteFastReplyImageRequest): Promise<void> => {
  // Buscar a resposta rápida apenas pelo ID e tenantId
  const fastReplyModel = await FastReply.findOne({
    where: { id: fastReplyId },
    attributes: ["id"] // Buscar apenas o ID
  });

  // Verificar se a resposta rápida existe
  if (!fastReplyModel) {
    throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
  }

  // Limpar o campo medias, definindo-o como array vazio
  fastReplyModel.medias = []; // Definir medias como array vazio

  // Atualizar a resposta rápida no banco de dados
  await fastReplyModel.save();
};

export default DeleteFastReplyImageService;
