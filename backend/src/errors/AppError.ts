// Classe responsável por padronizar os erros da aplicação
// Permite criar erros personalizados com mensagem e código de status HTTP
class AppError {
  // Mensagem descritiva do erro
  // Explica o que aconteceu de forma clara para o usuário
  public readonly message: string;

  // Código de status HTTP do erro
  // Indica o tipo de erro (400 para erro do cliente, 500 para erro do servidor, etc)
  public readonly statusCode: number;

  // Construtor que inicializa o erro com mensagem e código de status
  // Por padrão, usa o código 400 (Bad Request) se não especificado
  constructor(message: string, statusCode = 400) {
    this.message = message; // Inicializa a mensagem do erro
    this.statusCode = statusCode; // Inicializa o código de status do erro
  }
}

export default AppError; // Exporta a classe AppError para uso em outras partes da aplicação
