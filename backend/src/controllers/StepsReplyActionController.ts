import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/CreateStepsReplyActionService";
import DeleteStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/DeleteStepsReplyActionService";
import UpdateStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/UpdateStepsReplyActionService";

/**
 * Interface que define a estrutura de uma ação de resposta automática
 * Representa as ações que podem ser tomadas em cada passo do fluxo
 */
interface StepsReplyActionData {
  stepReplyId: number;         // ID do passo relacionado
  words: string;               // Palavras-chave que ativam a ação
  action: number;              // Tipo de ação (1: próximo passo, 2: fila, etc)
  userId: number;              // ID do usuário que criou/gerencia
  queueId?: number;            // ID da fila para transferência (opcional)
  userIdDestination?: number;  // ID do usuário destino (opcional)
  nextStepId?: number;         // ID do próximo passo no fluxo (opcional)
}

/**
 * Cria uma nova ação para um passo de resposta
 * Apenas administradores podem criar ações
 * Valida dados e garante consistência do fluxo
 * As ações definem o comportamento do chatbot
 */
/**
 * Cria uma nova ação para um passo de resposta
 * Apenas administradores podem criar ações
 * Valida dados e garante consistência do fluxo
 * As ações definem o comportamento do chatbot
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const stepsReplyActionData: StepsReplyActionData = {
    ...req.body,
    userId: req.user.id
  };

  const schema = Yup.object().shape({
    stepReplyId: Yup.number().required(),
    words: Yup.number().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(stepsReplyActionData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const stepsReplyAction = await CreateStepsReplyActionService(
    stepsReplyActionData
  );

  return res.status(200).json(stepsReplyAction);
};

/**
 * Atualiza uma ação existente
 * Permite modificar comportamentos e condições
 * Mantém integridade do fluxo de respostas
 * Importante para ajustar a lógica do chatbot
 */
/**
 * Atualiza uma ação existente
 * Permite modificar comportamentos e condições
 * Mantém integridade do fluxo de respostas
 * Importante para ajustar a lógica do chatbot
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const stepsReplyActionData: StepsReplyActionData = {
    ...req.body,
    userId: req.user.id
  };

  const schema = Yup.object().shape({
    stepReplyId: Yup.number().required(),
    words: Yup.number().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(stepsReplyActionData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { stepsReplyActionId } = req.params;
  const autoReply = await UpdateStepsReplyActionService({
    stepsReplyActionData,
    stepsReplyActionId
  });

  return res.status(200).json(autoReply);
};

/**
 * Remove uma ação do sistema
 * A remoção pode afetar o fluxo de respostas
 * Requer verificação de impactos antes da remoção
 * Importante para manter consistência do chatbot
 */
/**
 * Remove uma ação do sistema
 * A remoção pode afetar o fluxo de respostas
 * Requer verificação de impactos antes da remoção
 * Importante para manter consistência do chatbot
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { stepsReplyActionId } = req.params;

  await DeleteStepsReplyActionService(stepsReplyActionId);
  return res.status(200).json({ message: "Auto reply deleted" });
};
