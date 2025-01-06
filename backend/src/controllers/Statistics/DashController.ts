import { Request, Response } from "express"; 
import DashTicketsAndTimes from "../../services/Statistics/DashTicketsAndTimes"; 
import DashTicketsChannels from "../../services/Statistics/DashTicketsChannels"; 
import DashTicketsEvolutionChannels from "../../services/Statistics/DashTicketsEvolutionChannels"; 
import DashTicketsEvolutionByPeriod from "../../services/Statistics/DashTicketsEvolutionByPeriod"; 
import DashTicketsPerUsersDetail from "../../services/Statistics/DashTicketsPerUsersDetail"; 
import DashTicketsQueue from "../../services/Statistics/DashTicketsQueue"; 

type IndexQuery = {
  startDate: string; // Data de início para a consulta
  endDate: string; // Data de fim para a consulta
};

// ====================
// Função para obter dados de tickets e tempos
// ====================
export const getDashTicketsAndTimes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsAndTimes({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém dados de tickets e tempos

  return res.json(data); // Retorna os dados em formato JSON
};

// ====================
// Função para obter dados de tickets por canais
// ====================
export const getDashTicketsChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsChannels({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém dados de tickets por canais

  return res.json(data); // Retorna os dados em formato JSON
};

// ====================
// Função para obter evolução de tickets por canais
// ====================
export const getDashTicketsEvolutionChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsEvolutionChannels({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém evolução de tickets por canais

  return res.json(data); // Retorna os dados em formato JSON
};

// ====================
// Função para obter evolução de tickets por período
// ====================
export const getDashTicketsEvolutionByPeriod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsEvolutionByPeriod({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém evolução de tickets por período

  return res.json(data); // Retorna os dados em formato JSON
};

// ====================
// Função para obter detalhes de tickets por usuário
// ====================
export const getDashTicketsPerUsersDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsPerUsersDetail({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém detalhes de tickets por usuário

  return res.json(data); // Retorna os dados em formato JSON
};

// ====================
// Função para obter dados de tickets na fila
// ====================
export const getDashTicketsQueue = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta
  const userId = req.user.id; // Extrai o ID do usuário
  const userProfile = req.user.profile; // Extrai o perfil do usuário

  const data = await DashTicketsQueue({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  }); // Obtém dados de tickets na fila

  return res.json(data); // Retorna os dados em formato JSON
};
