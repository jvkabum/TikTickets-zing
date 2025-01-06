import ApiConfig from "../../models/ApiConfig";

// Interface que define a estrutura da resposta
// Retorna um array com todas as configurações de API encontradas
interface Response {
  apis: ApiConfig[];
}

// Interface que define os parâmetros necessários para listagem
// Requer apenas o ID do tenant para filtrar as configurações
interface Request {
  tenantId: number | string;
}

// Serviço responsável por listar todas as configurações de API de um tenant
// Retorna as configurações ordenadas alfabeticamente pelo nome
const ListApiConfigService = async ({
  tenantId
}: Request): Promise<Response> => {
  const apis = await ApiConfig.findAll({
    where: { tenantId },
    order: [["name", "ASC"]]
  });

  return { apis };
};

export default ListApiConfigService;
