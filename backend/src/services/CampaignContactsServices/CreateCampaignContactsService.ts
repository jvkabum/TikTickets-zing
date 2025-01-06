/* eslint-disable array-callback-return */
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CampaignContacts from "../../models/CampaignContacts";

// ====================
// Definição das Interfaces
// ====================

// Estrutura básica de um contato na campanha
interface CampaignContact {
  campaignId: string | number;  // ID da campanha
  contactId: string | number;   // ID do contato
}

// Parâmetros necessários para adicionar contatos à campanha
interface Request {
  campaignContacts: CampaignContact[];  // Lista de contatos a adicionar
  campaignId: string | number;          // ID da campanha
}

// Estrutura completa dos dados para criação
interface CampaignContactData {
  campaignId: string | number;  // ID da campanha
  contactId: string | number;   // ID do contato
}

// ====================
// Funções Auxiliares
// ====================

// Gera um número aleatório entre min e max (inclusive)
const randomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ====================
// Serviço Principal
// ====================

// Adiciona múltiplos contatos a uma campanha, distribuindo mensagens aleatoriamente
const CreateCampaignContactsService = async ({
  campaignContacts,
  campaignId
}: Request): Promise<void> => {
  // Função que gera um número aleatório entre min e max (inclusive)
  // Usada para distribuir aleatoriamente as mensagens entre os contatos
  // Retorna um número inteiro que será usado para selecionar qual mensagem enviar
  const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Busca todos os contatos que já estão vinculados a esta campanha
  // Importante para evitar duplicação de contatos na mesma campanha
  // Retorna uma lista de contatos já existentes para comparação
  const isCreateds = await CampaignContacts.findAll({
    where: {
      campaignId
    }
  });

  // Mapeia a lista de contatos para o formato necessário
  // Adiciona uma mensagem aleatória para cada contato
  // Retorna um array com os dados formatados para inserção
  const data: CampaignContactData[] = campaignContacts.map((contact: any) => {
    return {
      contactId: contact.id,
      campaignId,
      messageRandom: `message${randomInteger(1, 3)}`
    };
  });

  // Filtra os contatos para remover duplicatas
  // Verifica se cada contato já existe na campanha
  // Retorna apenas os contatos que ainda não foram adicionados
  const filterData = data.filter((d: any): any => {
    const isExists = isCreateds?.findIndex(
      (c: any) => d.contactId === c.contactId && +campaignId === c.campaignId
    );
    if (isExists === -1) {
      return d;
    }
  });

  // Define o esquema de validação dos dados
  // Garante que todos os campos obrigatórios estão presentes
  // Usa Yup para validar a estrutura dos dados antes de salvar
  const schema = Yup.array().of(
    Yup.object().shape({
      messageRandom: Yup.string().required(),
      campaignId: Yup.number().required(),
      contactId: Yup.number().required()
    })
  );

  // Valida os dados contra o esquema definido
  // Se houver erro na validação, lança uma exceção
  // Garante que os dados estão no formato correto
  try {
    await schema.validate(filterData);
  } catch (error) {
    throw new AppError(error.message);
  }

  // Cria os registros no banco de dados
  // Usa bulkCreate para inserir múltiplos registros de uma vez
  // Mais eficiente que criar um por um
  try {
    await CampaignContacts.bulkCreate(filterData);
  } catch (error) {
    throw new AppError(error.message);
  }
};

export default CreateCampaignContactsService;
