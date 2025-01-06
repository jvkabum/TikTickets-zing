import { QueryTypes } from 'sequelize';
import db from "../../database";

export const getDaysToClose = async (): Promise<number> => {
  try {
    const result = await db.query<{ value: string }>('SELECT value FROM public."Settings" WHERE key = ?', {
      replacements: ['daysToClose'],
      type: QueryTypes.SELECT
    });

    if (result && result.length > 0) {
      const value = parseInt(result[0].value, 10);
      
      // Adicione validações adicionais
      if (!isNaN(value) && value > 0) {
        return value;
      }
      
      console.warn('Valor de daysToClose inválido, usando padrão 7 dias');
      return 7; // Valor padrão se a configuração for inválida
    }

    console.warn('Configuração daysToClose não encontrada, usando padrão 7 dias');
    return 7; // Valor padrão se nenhuma configuração for encontrada
  } catch (error) {
    console.error('Erro ao recuperar a configuração daysToClose:', error);
    return 7; // Fallback para 7 dias em caso de erro
  }
};

export const setDaysToClose = async (days: number): Promise<void> => {
  try {
    // Atualizando o valor de daysToClose no banco
    await db.query('UPDATE public."Settings" SET value = ? WHERE key = ?', {
      replacements: [days.toString(), 'daysToClose'],
    });
  } catch (error) {
    // Tratar erro de atualização
    console.error('Erro ao atualizar daysToClose:', error);
  }
};
