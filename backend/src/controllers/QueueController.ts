import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateQueueService from "../services/QueueServices/CreateQueueService";
import ListQueueService from "../services/QueueServices/ListQueueService";
import DeleteQueueService from "../services/QueueServices/DeleteQueueService";
import UpdateQueueService from "../services/QueueServices/UpdateQueueService";

/**
 * Interface que define a estrutura de dados de uma fila
 */
interface QueueData {
  queue: string;           // Nome da fila
  isActive: boolean;       // Status de ativação da fila
  userId: number;          // ID do usuário que criou/modificou
  tenantId: number | string; // ID do tenant/organização
}

/**
 * Cria uma nova fila de atendimento
 * Apenas administradores podem criar filas
 * Valida os dados obrigatórios antes da criação
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newQueue: QueueData = { ...req.body, userId: req.user.id, tenantId };

  const schema = Yup.object().shape({
    queue: Yup.string().required(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newQueue);
  } catch (error) {
    throw new AppError(error.message);
  }

  const queue = await CreateQueueService(newQueue);

  return res.status(200).json(queue);
};

/**
 * Lista todas as filas do tenant
 * Retorna as filas de atendimento disponíveis
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const queues = await ListQueueService({ tenantId });
  return res.status(200).json(queues);
};

/**
 * Atualiza uma fila existente
 * Apenas administradores podem modificar filas
 * Valida os dados antes da atualização
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const queueData: QueueData = { ...req.body, userId: req.user.id, tenantId };

  const schema = Yup.object().shape({
    queue: Yup.string().required(),
    isActive: Yup.boolean().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(queueData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { queueId } = req.params;
  const queueObj = await UpdateQueueService({
    queueData,
    queueId
  });

  return res.status(200).json(queueObj);
};

/**
 * Remove uma fila do sistema
 * Apenas administradores podem remover filas
 * Verifica permissões antes da remoção
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { queueId } = req.params;

  await DeleteQueueService({ id: queueId, tenantId });
  return res.status(200).json({ message: "Queue deleted" });
};
