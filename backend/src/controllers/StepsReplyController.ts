import * as Yup from "yup";
import { Request, Response } from "express";

import CreateStepsReplyService from "../services/AutoReplyServices/StepsReplyServices/CreateStepsReplyService";
import AppError from "../errors/AppError";
import UpdateStepsReplyService from "../services/AutoReplyServices/StepsReplyServices/UpdateStepsReplyService";
import DeleteStepsReplyService from "../services/AutoReplyServices/StepsReplyServices/DeleteStepsReplyService";

/**
 * Interface que define a estrutura de um passo de resposta automática
 * Representa uma etapa específica no fluxo de respostas automáticas
 */
interface StepsReplyData {
  reply: string;          // Conteúdo da resposta para este passo
  idAutoReply: number;    // ID da resposta automática relacionada
  userId: number;         // ID do usuário que criou/gerencia
  initialStep: boolean;   // Indica se é o passo inicial do fluxo
}

/**
 * Cria um novo passo de resposta automática
 * Apenas administradores podem criar passos
 * Valida dados e garante consistência do fluxo
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newStepsReply: StepsReplyData = { ...req.body, userId: req.user.id };

  const schema = Yup.object().shape({
    reply: Yup.string().required(),
    idAutoReply: Yup.number().required(),
    userId: Yup.number().required(),
    initialStep: Yup.boolean().required()
  });

  try {
    await schema.validate(newStepsReply);
  } catch (error) {
    throw new AppError(error.message);
  }

  const stepsReply = await CreateStepsReplyService(newStepsReply);

  return res.status(200).json(stepsReply);
};

/**
 * Atualiza um passo de resposta existente
 * Permite modificar mensagem e configurações do passo
 * Mantém integridade do fluxo de respostas
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const stepsReplyData: StepsReplyData = req.body;

  const schema = Yup.object().shape({
    reply: Yup.string().required(),
    idAutoReply: Yup.number().required(),
    userId: Yup.number().required(),
    initialStep: Yup.boolean().required()
  });

  try {
    await schema.validate(stepsReplyData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { stepsReplyId } = req.params;
  const stepsReply = await UpdateStepsReplyService({
    stepsReplyData,
    stepsReplyId
  });

  return res.status(200).json(stepsReply);
};

/**
 * Remove um passo de resposta do sistema
 * A remoção pode afetar o fluxo de respostas
 * Requer verificação de impactos antes da remoção
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { stepsReplyId } = req.params;

  await DeleteStepsReplyService(stepsReplyId);
  return res.status(200).json({ message: "Steps reply deleted" });
};
