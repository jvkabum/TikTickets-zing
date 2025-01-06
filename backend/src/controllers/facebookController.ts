/* eslint-disable camelcase */
import { Request, Response } from "express";
import GetTokenAndLinkedPage from "../services/FacebookServices/GetTokenAndLinkedPage";
import SetLogoutLinkedPage from "../services/FacebookServices/SetLogoutLinkedPage";

/**
 * Controlador para gerenciar integrações com Facebook/Meta
 * Responsável por vincular e desvincular páginas do Facebook com o sistema
 */

/**
 * Vincula uma página do Facebook ao sistema
 * 
 * Este endpoint:
 * 1. Recebe os dados de autenticação do Facebook
 * 2. Obtém o token de acesso permanente
 * 3. Vincula a página selecionada à instância do WhatsApp
 * 4. Configura webhooks necessários
 * 
 * @param whatsapp - Dados da instância do WhatsApp
 * @param accountId - ID da conta do Facebook
 * @param userToken - Token de acesso temporário do usuário
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsapp, accountId, userToken } = req.body;

  // Processa a vinculação da página e configuração dos tokens
  await GetTokenAndLinkedPage({
    whatsapp,
    accountId,
    userToken,
    tenantId: req.user.tenantId
  });

  return res.status(200).json();
};

/**
 * Desvincula uma página do Facebook do sistema
 * 
 * Este endpoint:
 * 1. Remove tokens de acesso
 * 2. Desativa webhooks
 * 3. Remove a vinculação da página com a instância
 * 
 * É importante desvincular corretamente para:
 * - Evitar mensagens perdidas
 * - Remover permissões desnecessárias
 * - Manter a segurança da integração
 * 
 * @param whatsapp - Dados da instância do WhatsApp a ser desvinculada
 */
export const facebookLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const whatsapp = req.body;

  // Processa a desvinculação da página
  await SetLogoutLinkedPage({
    whatsapp,
    tenantId: req.user.tenantId
  });

  return res.status(200).json();
};
