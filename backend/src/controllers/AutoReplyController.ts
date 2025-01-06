import * as Yup from "yup";
import { Request, Response } from "express";

import CreateAutoReplyService from "../services/AutoReplyServices/CreateAutoReplyService";
import AppError from "../errors/AppError";
import ListAutoReplyService from "../services/AutoReplyServices/ListAutoReplyService";
import UpdateAutoReplyService from "../services/AutoReplyServices/UpdateAutoReplyService";
import DeleteAutoReplyService from "../services/AutoReplyServices/DeleteAutoReplyService";

/**
 * Interface que define a estrutura de uma resposta automática
 * Respostas automáticas são mensagens predefinidas enviadas automaticamente
 * baseadas em determinadas condições ou gatilhos
 */
interface AutoReplyData {
  name: string;              // Nome identificador da resposta
  action: number;            // Tipo de ação (1: mensagem, 2: encaminhamento, etc)
  userId: number;            // ID do usuário que criou/gerencia
  isActive: boolean;         // Status de ativação da resposta
  celularTeste?: string;     // Número para testes da resposta
  tenantId: number | string; // ID da organização/tenant
}

/**
 * Cria uma nova resposta automática
 * Apenas administradores podem criar respostas automáticas
 * Valida todos os campos obrigatórios antes da criação
 * Importante para automação do atendimento
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  // Verifica se o usuário é admin
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newAutoReply: AutoReplyData = { ...req.body, tenantId };

  // Schema de validação dos dados
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    tenantId: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(newAutoReply);
  } catch (error) {
    throw new AppError(error.message);
  }

  const autoReply = await CreateAutoReplyService(newAutoReply);

  return res.status(200).json(autoReply);
};

/**
 * Lista todas as respostas automáticas do tenant
 * Retorna respostas ativas e inativas para gerenciamento
 * Útil para visualizar e gerenciar automações existentes
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const autoReply = await ListAutoReplyService({ tenantId });
  return res.status(200).json(autoReply);
};

/**
 * Atualiza uma resposta automática existente
 * Permite modificar condições, mensagens e configurações
 * Mantém histórico do usuário que fez a alteração
 * Requer permissões administrativas
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const autoReplyData: AutoReplyData = req.body;

  // Schema de validação para atualização
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(autoReplyData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { autoReplyId } = req.params;
  const autoReply = await UpdateAutoReplyService({
    autoReplyData,
    autoReplyId,
    tenantId
  });

  return res.status(200).json(autoReply);
};

/**
 * Remove uma resposta automática do sistema
 * A remoção é permanente e desativa a automação
 * Requer confirmação de permissões administrativas
 * Importante verificar impactos antes da remoção
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const { autoReplyId } = req.params;

  await DeleteAutoReplyService({ id: autoReplyId, tenantId });
  return res.status(200).json({ message: "Auto reply deleted" });
};
