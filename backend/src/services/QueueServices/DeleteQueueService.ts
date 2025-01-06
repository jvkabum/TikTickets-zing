import Queue from "../../models/Queue";
import AppError from "../../errors/AppError";

// Interface que define os parâmetros necessários para remoção
// Requer identificação da fila e do tenant
interface Request {
  id: string;
  tenantId: number | string;
}

// Serviço responsável por remover uma fila de atendimento
// Verifica existência e dependências antes da remoção
const DeleteQueueService = async ({ id, tenantId }: Request): Promise<void> => {
  // Busca a fila no banco de dados
  // Verifica se ela existe antes de prosseguir
  const queue = await Queue.findOne({
    where: { id, tenantId }
  });

  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }
  try {
    await queue.destroy();
  } catch (error) {
    throw new AppError("ERR_QUEUE_TICKET_EXISTS", 404);
  }
};

export default DeleteQueueService;
