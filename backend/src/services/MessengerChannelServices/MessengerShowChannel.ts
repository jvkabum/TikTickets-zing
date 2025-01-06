import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

// Interface que define os parâmetros necessários para buscar um canal
// Requer o ID da página do Facebook associada ao canal
interface Data {
  fbPageId: string | number;
}

// Serviço responsável por buscar informações de um canal do Messenger
// Retorna os detalhes do canal com base no ID da página do Facebook
const MessengerShowChannel = async ({ fbPageId }: Data): Promise<Whatsapp> => {
  // Lista de atributos que devem ser retornados na consulta
  // Inclui informações essenciais do canal como tokens e IDs
  const attr = [
    "id",
    "name",
    "status",
    "type",
    "createdAt",
    "updatedAt",
    "tenantId",
    "tokenAPI",
    "fbPageId",
    "fbObject",
    "instagramKey"
  ];

  // Busca o canal no banco de dados
  // Filtra pelo ID da página do Facebook e seleciona apenas os atributos necessários
  const channel = await Whatsapp.findOne({
    where: {
      fbPageId
    },
    attributes: attr
  });

  // Verifica se o canal foi encontrado
  // Lança erro caso o canal não exista, evitando processamento inválido
  if (!channel) {
    throw new AppError("ERR_NO_CHANNEL_FOUND", 404);
  }

  // Retorna o canal encontrado com seus atributos

  return channel;
};

export default MessengerShowChannel;
