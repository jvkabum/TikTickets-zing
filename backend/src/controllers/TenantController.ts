import * as Yup from "yup"; 
import { Request, Response } from "express"; 
import { isMatch } from "date-fns"; 
import AppError from "../errors/AppError"; 

import UpdateBusinessHoursService from "../services/TenantServices/UpdateBusinessHoursService"; 
import ShowBusinessHoursAndMessageService from "../services/TenantServices/ShowBusinessHoursAndMessageService"; 
import UpdateMessageBusinessHoursService from "../services/TenantServices/UpdateMessageBusinessHoursService"; 

// ====================
// Função para atualizar horários de funcionamento
// ====================
export const updateBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado

  if (req.user.profile !== "admin") { // Verifica se o usuário tem permissão de administrador
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se não tiver permissão
  }

  const businessHours = req.body; // Extrai os horários de funcionamento do corpo da requisição

  const schema = Yup.array().of( // Define o esquema de validação dos horários de funcionamento
    Yup.object().shape({
      day: Yup.number().required().integer(), // Dia da semana (0-6)
      label: Yup.string().required(), // Nome do dia
      type: Yup.string().required(), // Tipo: 'O' para aberto, 'C' para fechado
      hr1: Yup.string()
        .required()
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm") // Valida o formato do horário
        ),
      hr2: Yup.string()
        .required()
        .test("isHoursValid", "${path} is not valid", value => {
          return isMatch(value || "", "HH:mm"); // Valida o formato do horário
        }),
      hr3: Yup.string()
        .required()
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm") // Valida o formato do horário
        ),
      hr4: Yup.string()
        .required()
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm") // Valida o formato do horário
        )
    })
  );

  try {
    await schema.validate(businessHours); // Valida os horários de funcionamento
  } catch (error) {
    throw new AppError(error.message); // Lança erro se a validação falhar
  }

  const newBusinessHours = await UpdateBusinessHoursService({ // Atualiza os horários de funcionamento
    businessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours); // Retorna os novos horários em formato JSON
};

// ====================
// Função para atualizar a mensagem de horários de funcionamento
// ====================
export const updateMessageBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado

  if (req.user.profile !== "admin") { // Verifica se o usuário tem permissão de administrador
    throw new AppError("ERR_NO_PERMISSION", 403); // Lança erro se não tiver permissão
  }

  const { messageBusinessHours } = req.body; // Extrai a mensagem de horários de funcionamento do corpo da requisição

  if (!messageBusinessHours) { // Verifica se a mensagem foi fornecida
    throw new AppError("ERR_NO_MESSAGE_INFORMATION", 404); // Lança erro se a mensagem não estiver presente
  }

  const newBusinessHours = await UpdateMessageBusinessHoursService({ // Atualiza a mensagem de horários de funcionamento
    messageBusinessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours); // Retorna a nova mensagem em formato JSON
};

// ====================
// Função para mostrar horários de funcionamento e mensagens
// ====================
export const showBusinessHoursAndMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user; // Extrai o ID do inquilino do usuário autenticado

  const tenant = await ShowBusinessHoursAndMessageService({ tenantId }); // Obtém horários de funcionamento e mensagens

  return res.status(200).json(tenant); // Retorna os dados em formato JSON
};
