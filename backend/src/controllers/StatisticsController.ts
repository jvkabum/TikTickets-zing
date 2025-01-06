// import Contact from '../models/Contact'; // Importa o modelo de contato (comentado, não utilizado)
import { Request, Response } from "express"; 
import TicketsQueuesService from "../services/Statistics/TicketsQueuesService"; 
import ContactsReportService from "../services/Statistics/ContactsReportService"; 
import AppError from "../errors/AppError"; 

// ====================
// Definição dos Tipos
// ====================

type IndexQuery = {
  dateStart: string; // Data de início para a consulta
  dateEnd: string; // Data de fim para a consulta
  status: string[]; // Status dos tickets
  queuesIds: string[]; // IDs das filas
  showAll: string; // Indica se deve mostrar todos os tickets
};

type tContactReport = {
  startDate: string; // Data de início para o relatório
  endDate: string; // Data de fim para o relatório
  tags?: number[] | string[]; // Tags para filtrar contatos
  ddds?: number[] | string[]; // DDDs para filtrar contatos
  searchParam?: string; // Parâmetro de busca para filtrar contatos
};

// ====================
// Função para obter dados de filas de tickets
// ====================
export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, profile, id: userId } = req.user; // Extrai informações do usuário autenticado
  const { dateStart, dateEnd, status, queuesIds, showAll } =
    req.query as IndexQuery; // Extrai parâmetros da consulta

  const tickets = await TicketsQueuesService({
    showAll: profile === "admin" ? showAll : false, // Permite mostrar todos os tickets se o usuário for admin
    dateStart,
    dateEnd,
    status,
    queuesIds,
    userId,
    tenantId
  }); // Obtém dados de filas de tickets

  return res.status(200).json(tickets); // Retorna os dados em formato JSON
};

// ====================
// Função para obter relatórios de contatos
// ====================
export const ContactsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se o usuário não for admin (comentado, não utilizado)
  // }
  const { startDate, endDate, tags, ddds, searchParam } =
    req.query as tContactReport; // Extrai parâmetros da consulta

  const tickets = await ContactsReportService({
    startDate,
    endDate,
    tags,
    ddds,
    tenantId,
    profile: req.user.profile, // Extrai o perfil do usuário
    userId: +req.user.id, // Extrai o ID do usuário
    searchParam
  }); // Obtém relatórios de contatos

  return res.status(200).json(tickets); // Retorna os dados em formato JSON
};
