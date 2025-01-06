/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'; 

// Middleware que valida o número de dias para fechar um ticket
// Garante que o valor seja um número válido dentro do intervalo permitido
export const validateDaysToCloseTicket = (req: Request, res: Response, next: NextFunction) => {
  // Extrai o valor de daysToClose do corpo da requisição
  // Este valor determina após quantos dias um ticket será fechado automaticamente
  const { daysToClose } = req.body;

  // Verifica se daysToClose é um número válido
  // Isso é necessário para evitar erros de processamento no sistema
  if (typeof daysToClose !== 'number') {
    return res.status(400).json({
      message: "'daysToClose' deve ser um número." // Retorna erro se daysToClose não for um número
    });
  }

  // Verifica se daysToClose está dentro do intervalo permitido (1 a 365 dias)
  // Isso garante que tickets não fiquem abertos indefinidamente ou fechem muito rápido
  if (daysToClose < 1 || daysToClose > 365) {
    return res.status(400).json({
      message: "'daysToClose' deve ser um número entre 1 e 365." // Retorna erro se daysToClose estiver fora do intervalo
    });
  }

  // Se todas as validações passarem, permite que a requisição continue
  // O valor de daysToClose será usado para configurar o fechamento automático do ticket
  next(); // Chama o próximo middleware
};
