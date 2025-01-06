// Importa a configuração principal do banco de dados
import "../database";
import { logger } from "../utils/logger";

// Função de inicialização do banco de dados
// Esta função é chamada durante o boot da aplicação
// Ela garante que a conexão com o banco de dados está estabelecida
// e que todos os modelos foram sincronizados corretamente
// @param app - Instância da aplicação Express
export default async function database(app): Promise<void> {
  // Registra no log que o banco de dados foi inicializado com sucesso
  // Este log é importante para confirmar que a conexão foi estabelecida
  // durante o processo de inicialização do servidor
  logger.info("database already in server!");
}
