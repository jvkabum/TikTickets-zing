import database from "../../database"; // Importa a instância do banco de dados

// ====================
// Função para Truncar o Banco de Dados
// ====================
const truncate = async (): Promise<void> => {
  await database.truncate({ force: true, cascade: true }); // Trunca o banco de dados forçando a remoção e aplicando em cascata
};

// ====================
// Função para Desconectar do Banco de Dados
// ====================
const disconnect = async (): Promise<void> => {
  return database.connectionManager.close(); // Fecha a conexão com o banco de dados
};

// Exporta as funções truncate e disconnect
export { truncate, disconnect };
