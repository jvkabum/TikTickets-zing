import * as Sentry from "@sentry/node";
import expressInstance, { NextFunction, Request, Response } from "express";
import { readFileSync } from "fs";
import moment from "moment";
import uploadConfig from "../config/upload";
import AppError from "../errors/AppError";
import routes from "../routes";
import { logger } from "../utils/logger";

// Função principal para configuração dos módulos da aplicação
export default async function modules(app): Promise<void> {
  // Lê a versão do projeto do package.json
  const { version } = JSON.parse(readFileSync("./package.json").toString());
  // Registra o momento de início do servidor
  const started = new Date();
  const { env } = process;

  // O Sentry já foi inicializado antecipadamente pelo src/instrument.ts
  // para garantir a instrumentação correta do Express e Profiling.

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

  // Rota de teste para o Sentry
  app.get("/debug-sentry", (req, res) => {
    throw new Error("My first Sentry error from TikTickets Backend!");
  });

  // Adiciona o handler de requisições do Sentry
  // No Sentry v10+, o requestHandler não é mais obrigatório se usar setupExpressErrorHandler
  // app.use(Sentry.Handlers.requestHandler());

  // Configura pasta pública para arquivos estáticos
  app.use("/public", expressInstance.static(uploadConfig.directory));

  // Carrega todas as rotas da aplicação
  app.use(routes);

  // Adiciona o handler de erros do Sentry
  // Adiciona o handler de erros moderno do Sentry v10
  Sentry.setupExpressErrorHandler(app);

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
