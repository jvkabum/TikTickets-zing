import { Sequelize } from "sequelize-typescript"; 
import User from "../models/User"; 
import Setting from "../models/Setting"; 
import Contact from "../models/Contact"; 
import Ticket from "../models/Ticket"; 
import Whatsapp from "../models/Whatsapp"; 
import ContactCustomField from "../models/ContactCustomField"; 
import Message from "../models/Message"; 
import MessageOffLine from "../models/MessageOffLine"; 
import AutoReply from "../models/AutoReply"; 
import StepsReply from "../models/StepsReply"; 
import StepsReplyAction from "../models/StepsReplyAction"; 
import Queue from "../models/Queue"; 
import UsersQueues from "../models/UsersQueues"; 
import Tenant from "../models/Tenant"; 
import AutoReplyLogs from "../models/AutoReplyLogs"; 
import UserMessagesLog from "../models/UserMessagesLog"; 
import FastReply from "../models/FastReply"; 
import Tag from "../models/Tag"; 
import ContactWallet from "../models/ContactWallet"; 
import ContactTag from "../models/ContactTag"; 
import Campaign from "../models/Campaign"; 
import CampaignContacts from "../models/CampaignContacts"; 
import ApiConfig from "../models/ApiConfig"; 
import ApiMessage from "../models/ApiMessage"; 
import LogTicket from "../models/LogTicket"; 
import ChatFlow from "../models/ChatFlow"; 
import * as QueueJobs from "../libs/Queue"; 
import { logger } from "../utils/logger"; 

// ====================
// Definição da Interface
// ====================

// Interface personalizada para o Sequelize
interface CustomSequelize extends Sequelize {
  afterConnect?: any; // Função a ser chamada após a conexão
  afterDisconnect?: any; // Função a ser chamada após a desconexão
}

// Configurações do banco de dados
const dbConfig = require("../config/database"); 

const sequelize: CustomSequelize = new Sequelize(dbConfig); // Cria uma nova instância do Sequelize com as configurações

// Lista de modelos a serem adicionados ao Sequelize
const models = [
  User, // Modelo de Usuário
  Contact, // Modelo de Contato
  Ticket, // Modelo de Ticket
  Message, // Modelo de Mensagem
  MessageOffLine, // Modelo de Mensagem Offline
  Whatsapp, // Modelo de WhatsApp
  ContactCustomField, // Modelo de Campo Personalizado de Contato
  Setting, // Modelo de Configuração
  AutoReply, // Modelo de Resposta Automática
  StepsReply, // Modelo de Passos de Resposta
  StepsReplyAction, // Modelo de Ação de Passos de Resposta
  Queue, // Modelo de Fila
  UsersQueues, // Modelo de Filas de Usuários
  Tenant, // Modelo de Inquilino
  AutoReplyLogs, // Modelo de Logs de Respostas Automáticas
  UserMessagesLog, // Modelo de Logs de Mensagens de Usuários
  FastReply, // Modelo de Resposta Rápida
  Tag, // Modelo de Tag
  ContactWallet, // Modelo de Carteira de Contato
  ContactTag, // Modelo de Tag de Contato
  Campaign, // Modelo de Campanha
  CampaignContacts, // Modelo de Contatos de Campanha
  ApiConfig, // Modelo de Configuração de API
  ApiMessage, // Modelo de Mensagem de API
  LogTicket, // Modelo de Log de Ticket
  ChatFlow // Modelo de Fluxo de Chat
];

// Adiciona os modelos ao Sequelize
sequelize.addModels(models);

// Função chamada após a conexão com o banco de dados
sequelize.afterConnect(() => {
  logger.info("DATABASE CONNECT"); // Registra que a conexão com o banco de dados foi estabelecida
  QueueJobs.default.add("VerifyTicketsChatBotInactives", {}); // Adiciona job para verificar tickets inativos
  QueueJobs.default.add("SendMessageSchenduled", {}); // Adiciona job para enviar mensagens agendadas
});

// Função chamada após a desconexão do banco de dados
sequelize.afterDisconnect(() => {
  logger.info("DATABASE DISCONNECT"); // Registra que a desconexão com o banco de dados ocorreu
});

export default sequelize; // Exporta a instância do Sequelize
