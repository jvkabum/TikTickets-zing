import Queue from "../../models/Queue";

// Interface que define os parâmetros necessários para listagem
// Requer apenas o ID do tenant para filtrar as filas
interface Request {
  tenantId: string | number;
}
// Serviço responsável por listar filas de atendimento
// Retorna todas as filas de um tenant ordenadas por nome
const ListQueueService = async ({ tenantId }: Request): Promise<Queue[]> => {
  // Busca todas as filas do tenant
  // Ordena alfabeticamente pelo nome da fila
  const queueData = await Queue.findAll({
    where: {
      tenantId
    },
    order: [["queue", "ASC"]]
  });

  return queueData;
};

export default ListQueueService;
