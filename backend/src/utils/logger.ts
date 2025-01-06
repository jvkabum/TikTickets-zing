import winston from "winston"; 

// ====================
// Configuração do Logger
// ====================

// Configuração do sistema de logs da aplicação
// Utiliza Winston para gerenciar diferentes níveis e formatos de log

// Define o formato padrão para logs em arquivo JSON
// Inclui stack trace de erros, timestamp e formatação legível
const jsonLogFileFormat = winston.format.combine(
  winston.format.errors({ stack: true }), // Inclui stack trace de erros
  winston.format.timestamp(), // Adiciona timestamp aos logs
  winston.format.prettyPrint() // Formata os logs de forma legível
);

// Define o ambiente de execução
// Usa 'prod' como padrão se não houver variável de ambiente
let env = "prod";
if (process.env?.NODE_ENV) {
  env = process.env.NODE_ENV; // Atualiza o ambiente se a variável estiver definida
}

// Define o nível de log baseado no ambiente
// Produção usa 'info', outros ambientes usam 'debug'
const level = env === "prod" ? "info" : "debug";

// Cria o logger principal com múltiplos transportes
// Permite logging no console, arquivo e HTTP
const logger = winston.createLogger({
  level, // Define o nível de log
  format: jsonLogFileFormat, // Define o formato dos logs

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }), // Inclui stack trace de erros
        winston.format.colorize(), // Adiciona cores aos logs no console
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            // print log trace
            return `${level}: ${timestamp} ${message} - ${stack}`; // Formato com stack trace
          }
          return `${level}: ${timestamp} ${message}`; // Formato sem stack trace
        })
      )
    }),
    new winston.transports.File({
      filename: "./logs/app.logg", // Caminho do arquivo de log
      level: "error", // Nível de log para este transporte
      handleExceptions: true, // Trata exceções não capturadas
      maxsize: 10485760, // Tamanho máximo do arquivo de log (10MB)
      maxFiles: 10 // Número máximo de arquivos de log a serem mantidos
    }),
    new winston.transports.Http({
      level: "warn", // Nível de log para este transporte
      format: winston.format.json() // Formato dos logs enviados via HTTP
    })
  ]
});

export { logger }; // Exporta o logger para uso em outras partes da aplicação
