/* eslint-disable no-unused-vars */
import pino from "pino"; // Importa a biblioteca pino para logging

// ====================
// Configuração do Logger
// ====================

// Configuração do logger para diferentes ambientes
const configPino = {
  dev: { // Configuração para ambiente de desenvolvimento
    enabled: true, // Habilita o logger
    level: "info" // Define o nível de log como 'info'
  },
  prod: { // Configuração para ambiente de produção
    enabled: true, // Habilita o logger
    level: "info", // Define o nível de log como 'info'
    prettyPrint: { // Formatação de saída para logs
      ignore: "pid,hostname" // Ignora pid e hostname na saída
    }
  }
};

// ====================
// Definição do Ambiente
// ====================

// Define o ambiente padrão como 'prod'
let env = "prod";
if (process.env?.NODE_ENV) { // Verifica se a variável de ambiente NODE_ENV está definida
  env = process.env.NODE_ENV; // Se estiver, atualiza o ambiente
}

// ====================
// Criação da Instância do Logger
// ====================

// Cria uma instância do logger com base no ambiente atual
const logger = pino(env === "prod" ? configPino.prod : configPino.dev);

// ====================
// Exportação do Logger
// ====================

// Exporta o logger para ser utilizado em outros módulos
export { logger };
