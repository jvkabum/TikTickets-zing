import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

/**
 * Controlador para importação de contatos do WhatsApp
 * Responsável por gerenciar a importação de contatos da agenda do WhatsApp para o sistema
 */

/**
 * Importa contatos do WhatsApp
 * 
 * Este endpoint:
 * 1. Conecta com a instância do WhatsApp
 * 2. Busca todos os contatos salvos
 * 3. Sincroniza com o banco de dados
 * 4. Atualiza informações como:
 *    - Nome do contato
 *    - Foto de perfil
 *    - Status de verificação do número
 * 
 * É um processo assíncrono que pode demorar dependendo
 * da quantidade de contatos a serem importados
 * 
 * @param tenantId - ID do tenant para isolamento dos contatos
 * @returns Mensagem confirmando início da importação
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  // Obtém o ID do tenant do usuário logado
  const { tenantId } = req.user;

  // Inicia o processo de importação em background
  await ImportContactsService(tenantId);

  // Retorna resposta imediata, já que a importação
  // continua processando em segundo plano
  return res.status(200).json({ message: "contacts imported" });
};
