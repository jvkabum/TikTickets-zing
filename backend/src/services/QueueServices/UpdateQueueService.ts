import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

// Interface que define os dados atualizáveis de uma fila
// Inclui todas as propriedades que podem ser modificadas
interface QueueData {
  queue: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
}

// Interface que define os parâmetros necessários para atualização
// Combina novos dados com identificador da fila
interface Request {
  queueData: QueueData;
  queueId: string;
}

// Serviço responsável por atualizar uma fila de atendimento
// Verifica existência e atualiza dados no banco
const UpdateQueueService = async ({
  queueData,
  queueId
}: Request): Promise<Queue> => {
  const { queue, isActive, userId, tenantId } = queueData;

  const queueModel = await Queue.findOne({
    where: { id: queueId, tenantId },
    attributes: ["id", "queue", "isActive", "userId"]
  });

  if (!queueModel) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }

  await queueModel.update({
    queue,
    isActive,
    userId
  });

  await queueModel.reload({
    attributes: ["id", "queue", "isActive", "userId"]
  });

  return queueModel;
};

export default UpdateQueueService;
