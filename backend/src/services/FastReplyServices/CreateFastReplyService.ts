import FastReply from "../../models/FastReply";
import AppError from "../../errors/AppError";

interface Request {
  key: string;
  message: string;
  userId: number;
  tenantId: number | string;
  medias?: string[]; // Cadastra os caminhos dos arquivos
}

const CreateFastReplyService = async ({
  key,
  message,
  userId,
  tenantId,
  medias,
}: Request): Promise<FastReply> => {
  // Verificação de dados de entrada
  if (!key || !message || !userId || !tenantId) {
    throw new AppError('Todos os campos são obrigatórios', 400);
  }

  try {
    const fastReplyData = await FastReply.create({
      key,
      message,
      userId,
      tenantId,
      medias, // Salvando os caminhos das imagens
    });

    return fastReplyData;
  } catch (error) {
    console.error('Erro ao criar resposta rápida:', error);
    throw new AppError('Erro ao criar resposta rápida', 500);
  }
};

export default CreateFastReplyService;
