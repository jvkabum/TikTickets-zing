import { Request, Response } from "express";

import CreateChatFlowService from "../services/ChatFlowServices/CreateChatFlowService";
import ListChatFlowService from "../services/ChatFlowServices/ListChatFlowService";
import AppError from "../errors/AppError";
import UpdateChatFlowService from "../services/ChatFlowServices/UpdateChatFlowService";
import DeleteChatFlowService from "../services/ChatFlowServices/DeleteChatFlowService";

/**
 * Interface que define a estrutura de uma linha de conexão no fluxo
 * Representa as conexões entre diferentes nós do fluxo de chat
 */
interface Line {
  connector: string;     // Tipo de conector visual
  from: string;         // ID do nó de origem
  paintStyle: string | any; // Estilo visual da linha
  to: string;           // ID do nó de destino
}

/**
 * Interface que define configurações avançadas do fluxo
 * Controla comportamentos específicos do chatbot
 */
interface Configuration {
  // Configuração para tentativas máximas de mensagens do bot
  maxRetryBotMessage: {
    destiny: string;    // Para onde enviar após máximo de tentativas
    number: number;     // Número máximo de tentativas
    type: number;       // Tipo de ação após exceder tentativas
  };
  // Mensagem quando nenhuma opção é selecionada
  notOptionsSelectMessage: {
    message: string;    // Mensagem de erro
    stepReturn: string; // Passo para retornar
  };
  // Configuração para ausência de resposta
  notResponseMessage: {
    destiny: string;    // Para onde enviar se não houver resposta
    time: number;       // Tempo de espera
    type: number;       // Tipo de ação após timeout
  };
}

/**
 * Interface que define a estrutura de um nó no fluxo
 * Cada nó representa um passo no fluxo de conversação
 */
interface NodeList {
  ico?: string;         // Ícone do nó
  id: string;           // ID único do nó
  left: string;         // Posição horizontal no editor
  name: string;         // Nome do nó
  status: string;       // Status atual
  style?: string | any; // Estilo visual
  top: string;          // Posição vertical no editor
  type?: string;        // Tipo de nó (mensagem, condição, etc)
  viewOnly?: boolean;   // Se é apenas visualização
  configurations?: Configuration; // Configurações específicas
  actions?: [];         // Ações disponíveis
  conditions?: [];      // Condições de fluxo
  interactions?: [];    // Interações possíveis
}

/**
 * Interface que define a estrutura completa do fluxo
 * Representa todo o fluxo de conversação do chatbot
 */
interface Flow {
  name: string;         // Nome do fluxo
  lineList: Line[];     // Lista de conexões
  nodeList: NodeList[]; // Lista de nós
}

/**
 * Interface que define os dados necessários para um fluxo de chat
 * Combina o fluxo com metadados importantes
 */
interface ChatFlowData {
  flow: Flow;           // Estrutura do fluxo
  name: string;         // Nome identificador
  userId: number;       // Usuário responsável
  isActive: boolean;    // Status de ativação
  celularTeste?: string; // Número para testes
  tenantId: number | string; // ID do tenant
}

/**
 * Cria um novo fluxo de chat
 * 
 * Este endpoint configura um novo fluxo de conversação automatizada.
 * É usado para definir como o chatbot deve interagir com os usuários,
 * incluindo mensagens, condições e ações em cada etapa.
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  // Apenas administradores podem criar fluxos
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Prepara os dados do novo fluxo
  const newFlow: ChatFlowData = {
    flow: { ...req.body },      // Estrutura do fluxo
    name: req.body.name,        // Nome identificador
    isActive: true,             // Inicia ativo
    userId: +req.user.id,       // Usuário criador
    tenantId                    // Organização
  };

  // Cria o fluxo no banco de dados
  const chatFlow = await CreateChatFlowService(newFlow);

  return res.status(200).json(chatFlow);
};

/**
 * Lista todos os fluxos de chat do tenant
 * 
 * Retorna todos os fluxos configurados para a organização,
 * permitindo visualizar e gerenciar os diferentes fluxos de conversação.
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const chatFlow = await ListChatFlowService({ tenantId });
  return res.status(200).json(chatFlow);
};

/**
 * Atualiza um fluxo de chat existente
 * 
 * Permite modificar a estrutura e configurações de um fluxo,
 * incluindo nós, conexões e regras de conversação.
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;

  // Prepara dados atualizados do fluxo
  const newFlow: ChatFlowData = {
    flow: { ...req.body },           // Nova estrutura
    name: req.body.name,             // Novo nome
    isActive: req.body.isReactive,   // Status atualizado
    userId: +req.user.id,            // Usuário que atualizou
    tenantId
  };

  // Atualiza o fluxo no banco de dados
  const { chatFlowId } = req.params;
  const chatFlow = await UpdateChatFlowService({
    chatFlowData: newFlow,
    chatFlowId,
    tenantId
  });

  return res.status(200).json(chatFlow);
};

/**
 * Remove um fluxo de chat
 * 
 * Este endpoint exclui permanentemente um fluxo de chat.
 * É importante notar que:
 * - A exclusão é irreversível
 * - Conversas em andamento podem ser afetadas
 * - Histórico de interações é mantido
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatFlowId } = req.params;
  const { tenantId } = req.user;

  // Remove o fluxo do banco de dados
  await DeleteChatFlowService({ id: chatFlowId, tenantId });

  return res.status(200).json({ message: "Flow deleted" });
};
