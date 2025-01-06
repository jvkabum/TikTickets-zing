// import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

// Interface que define os dados necessários para criar uma fila
// Inclui informações básicas da fila e identificadores
interface Request {
  queue: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
}

// Serviço responsável por criar uma nova fila de atendimento
// Registra a fila no sistema com suas configurações iniciais
const CreateQueueService = async ({
  queue,
  isActive,
  userId,
  tenantId
}: Request): Promise<Queue> => {
  const queueData = await Queue.create({
    queue,
    isActive,
    userId,
    tenantId
  });

  return queueData;
};

export default CreateQueueService;
