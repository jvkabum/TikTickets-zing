import { Request, Response } from "express"; 
// import * as Yup from "yup"; // Importa a biblioteca Yup para validação (comentado, não utilizado)
import StatisticsPerUser from "../../services/Statistics/StatisticsPerUsers"; // Importa serviço para obter estatísticas por usuário
// import AppError from "../errors/AppError"; // Importa a classe de erro personalizada para tratamento de erros (comentado, não utilizado)

type IndexQuery = {
  startDate: string; // Data de início para a consulta
  endDate: string; // Data de fim para a consulta
};

// Função para obter estatísticas por usuário
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado
  const { startDate, endDate } = req.query as IndexQuery; // Extrai as datas de início e fim da consulta

  const data = await StatisticsPerUser({
    startDate, // Data de início para a consulta
    endDate, // Data de fim para a consulta
    tenantId // ID do inquilino
  }); // Obtém estatísticas por usuário

  return res.json(data); // Retorna os dados em formato JSON
};
