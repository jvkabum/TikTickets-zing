import { readFileSync } from "fs";
import moment from "moment";
import expressInstance, { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import routes from "../routes";
import uploadConfig from "../config/upload";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";

// Função principal para configuração dos módulos da aplicação
export default async function modules(app): Promise<void> {
  // Lê a versão do projeto do package.json
  const { version } = JSON.parse(readFileSync("./package.json").toString());
  // Registra o momento de início do servidor
  const started = new Date();
  const { env } = process;

  // Inicializa o Sentry para monitoramento de erros
  // Configura com as informações do ambiente
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    serverName: env.BACKEND_URL,
    release: version
  });

  // Rota de verificação de saúde do servidor
  // Retorna informações sobre o estado atual do servidor
  app.get("/health", async (req, res) => {
    let checkConnection;
    try {
      checkConnection = "Servidor disponível!";
    } catch (e) {
      checkConnection = `Servidor indisponível! ${e}`;
    }
    // Retorna dados sobre o estado do servidor
    res.json({
      started: moment(started).format("DD/MM/YYYY HH:mm:ss"), // Data/hora de início
      currentVersion: version, // Versão atual
      uptime: (Date.now() - Number(started)) / 1000, // Tempo de atividade em segundos
      statusService: checkConnection // Status da conexão
    });
  });

  // Adiciona o handler de requisições do Sentry
  app.use(Sentry.Handlers.requestHandler());

  // Configura pasta pública para arquivos estáticos
  app.use("/public", expressInstance.static(uploadConfig.directory));

  // Carrega todas as rotas da aplicação
  app.use(routes);

  // Adiciona o handler de erros do Sentry
  app.use(Sentry.Handlers.errorHandler());

  // Middleware global para tratamento de erros
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
    // Tratamento de erros personalizados da aplicação
    if (err instanceof AppError) {
      // Log diferenciado para erros de permissão (403)
      if (err.statusCode === 403) {
        logger.warn(err);
      } else {
        logger.error(err);
      }
      return res.status(err.statusCode).json({ error: err.message });
    }

    // Tratamento de erros não esperados
    logger.error(err);
    return res.status(500).json({ error: `Internal server error: ${err}` });
  });

  // Log indicando que os módulos foram carregados com sucesso
  logger.info("modules routes already in server!");
}
