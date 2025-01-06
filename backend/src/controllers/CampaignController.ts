import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignService from "../services/CampaignServices/CreateCampaignService";
import ListCampaignService from "../services/CampaignServices/ListCampaignService";
import DeleteCampaignService from "../services/CampaignServices/DeleteCampaignService";
import UpdateCampaignService from "../services/CampaignServices/UpdateCampaignService";
import StartCampaignService from "../services/CampaignServices/StartCampaignService";
import CancelCampaignService from "../services/CampaignServices/CancelCampaignService";

/**
 * Interface que define a estrutura de dados de uma campanha.
 * Uma campanha é uma sequência programada de mensagens enviadas para uma lista de contatos.
 * Permite até 3 mensagens diferentes para criar uma sequência de comunicação mais elaborada,
 * com possibilidade de incluir mídia (imagens, vídeos, etc) para maior engajamento.
 */
interface CampaignData {
  name: string;       // Nome identificador único da campanha
  start: string;      // Data/hora inicial - Define quando a campanha começará a enviar mensagens
  end: string;        // Data/hora final - Define quando a campanha deve parar de enviar mensagens
  message1: string;   // Primeira mensagem - Mensagem inicial/principal da campanha
  message2: string;   // Segunda mensagem - Mensagem de follow-up (opcional)
  message3: string;   // Terceira mensagem - Mensagem final/conclusão (opcional)
  mediaUrl: string;   // URL da mídia - Permite enriquecer a mensagem com conteúdo visual
  userId: string;     // ID do usuário responsável - Para rastreamento e permissões
  sessionId: string;  // ID da sessão WhatsApp - Define qual conexão será usada para envio
  delay: string;      // Intervalo entre mensagens - Evita bloqueios por spam
  tenantId: string;   // ID da empresa - Para isolamento de dados entre organizações
}

/**
 * Cria uma nova campanha de mensagens.
 * 
 * Este endpoint é responsável por configurar uma nova campanha no sistema.
 * O processo envolve:
 * 1. Verificação de permissões (apenas admins podem criar campanhas)
 * 2. Validação dos dados recebidos (garante que todos os campos obrigatórios estejam presentes)
 * 3. Processamento de arquivos de mídia (se houver)
 * 4. Criação da campanha no banco de dados
 * 
 * A validação rigorosa dos dados é crucial pois uma campanha mal configurada
 * pode resultar em envios incorretos ou problemas de execução.
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  // Extrai o ID do tenant do usuário logado para isolamento de dados
  const { tenantId } = req.user;
  
  // Processa arquivos de mídia enviados
  // Importante para campanhas que incluem imagens, vídeos ou outros arquivos
  const medias = req.files as Express.Multer.File[];
  
  // Verifica se o usuário tem permissão de administrador
  // Esta verificação é crucial pois campanhas podem impactar muitos contatos
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Prepara os dados da campanha incluindo metadados importantes
  const campaign: CampaignData = {
    ...req.body,
    userId: req.user.id,  // Rastreia quem criou a campanha
    tenantId              // Mantém isolamento entre organizações
  };

  // Define regras estritas de validação
  // Cada campo é validado para garantir integridade dos dados
  const schema = Yup.object().shape({
    name: Yup.string().required(),      // Nome é essencial para identificação
    start: Yup.string().required(),     // Data de início para agendamento
    message1: Yup.string().required(),  // Pelo menos uma mensagem é obrigatória
    message2: Yup.string().required(),  // Segunda mensagem para follow-up
    message3: Yup.string().required(),  // Terceira mensagem para conclusão
    userId: Yup.string().required(),    // Usuário responsável
    sessionId: Yup.string().required(), // Sessão WhatsApp para envio
    tenantId: Yup.number().required()   // Tenant para isolamento
  });

  // Executa validação e trata erros de forma apropriada
  try {
    await schema.validate(campaign);
  } catch (error) {
    throw new AppError(error.message);
  }

  // Cria a campanha usando o serviço especializado
  // O serviço lida com a lógica de negócios e persistência
  const newCampaign = await CreateCampaignService({
    campaign,
    medias  // Passa arquivos de mídia para processamento
  });

  // Retorna a campanha criada com status 200
  return res.status(200).json(newCampaign);
};

/**
 * Lista todas as campanhas do tenant.
 * 
 * Este endpoint retorna todas as campanhas associadas ao tenant do usuário,
 * permitindo visualizar tanto campanhas ativas quanto inativas.
 * É útil para:
 * - Monitoramento de campanhas em andamento
 * - Análise de campanhas passadas
 * - Planejamento de novas campanhas
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const campaigns = await ListCampaignService({ tenantId });
  return res.status(200).json(campaigns);
};

/**
 * Atualiza uma campanha existente.
 * 
 * Permite modificar configurações de uma campanha antes de seu início.
 * É importante notar que:
 * - Apenas administradores podem fazer alterações
 * - Campanhas em andamento têm limitações no que pode ser alterado
 * - Todas as alterações são validadas antes de serem aplicadas
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  // Processa novos arquivos de mídia, se houver
  const medias = req.files as Express.Multer.File[];

  // Verifica permissões administrativas
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Prepara dados atualizados mantendo metadados importantes
  const campaignData: CampaignData = {
    ...req.body,
    userId: req.user.id,
    tenantId
  };

  // Valida dados atualizados com as mesmas regras estritas
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string().required(),
    message3: Yup.string().required(),
    mediaUrl: Yup.string().required(),
    userId: Yup.string().required(),
    sessionId: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  // Atualiza a campanha e processa novas mídias
  const { campaignId } = req.params;
  const campaignObj = await UpdateCampaignService({
    campaignData,
    medias,
    campaignId,
    tenantId
  });

  return res.status(200).json(campaignObj);
};

/**
 * Remove uma campanha do sistema.
 * 
 * Este endpoint permite a exclusão de uma campanha, mas com algumas considerações:
 * - Campanhas em andamento devem ser canceladas antes
 * - A exclusão é permanente e não pode ser desfeita
 * - Apenas administradores podem excluir campanhas
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await DeleteCampaignService({ id: campaignId, tenantId });
  return res.status(200).json({ message: "Campaign deleted" });
};

/**
 * Inicia a execução de uma campanha.
 * 
 * Este endpoint é responsável por:
 * 1. Verificar se a campanha está pronta para início
 * 2. Configurar a fila de envio de mensagens
 * 3. Iniciar o processamento das mensagens
 * 
 * O delay entre mensagens é crucial para:
 * - Evitar bloqueios por spam
 * - Melhorar taxas de entrega
 * - Simular comportamento humano
 */
export const startCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  // Inicia com delay de 2 segundos entre mensagens
  await StartCampaignService({
    campaignId,
    tenantId,
    options: {
      delay: 2000 // Valor otimizado para evitar bloqueios
    }
  });

  return res.status(200).json({ message: "Campaign started" });
};

/**
 * Cancela uma campanha em andamento.
 * 
 * Este endpoint permite interromper uma campanha, o que envolve:
 * 1. Parar o envio de novas mensagens
 * 2. Limpar a fila de mensagens pendentes
 * 3. Atualizar o status da campanha
 * 4. Registrar o momento do cancelamento
 */
export const cancelCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await CancelCampaignService({
    campaignId,
    tenantId
  });

  return res.status(200).json({ message: "Campaign canceled" });
};
