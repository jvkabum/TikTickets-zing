import "reflect-metadata";
import "express-async-errors";
import { Application, json, urlencoded, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { logger } from "../utils/logger";

// Função principal de configuração do Express
export default async function express(app: Application): Promise<void> {
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);

        // Allow any localhost origin in development environment
        if (process.env.NODE_ENV === "dev" && requestOrigin.startsWith("http://localhost")) {
          return callback(null, true);
        }

        const allowedOrigin = process.env.FRONTEND_URL || "https://app.tikanais.com.br";
        if (requestOrigin === allowedOrigin) {
          return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    })
  );

  // Aplica configurações de segurança apenas em ambientes de produção
  if (process.env.NODE_ENV !== "dev") {
    // Adiciona headers de segurança usando o Helmet
    app.use(helmet());

    // Configura a Política de Segurança de Conteúdo (CSP)
    // Define regras para carregamento de recursos (scripts, estilos, imagens, etc)
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          "default-src": ["'self'"],
          "base-uri": ["'self'"],
          "block-all-mixed-content": [],
          "font-src": ["'self'", "https:", "data:"],
          "img-src": ["'self'", "data:"],
          "object-src": ["'none'"],
          "script-src-attr": ["'none'"],
          "style-src": ["'self'", "https:", "'unsafe-inline'"],
          "upgrade-insecure-requests": [],
          scriptSrc: [
            "'self'",
            `*${process.env.FRONTEND_URL || "localhost:3101"}`
          ],
          frameAncestors: [
            "'self'",
            `* ${process.env.FRONTEND_URL || "localhost:3101"}`
          ]
        }
      })
    );

    // Configura políticas de recursos cross-origin
    // Permite compartilhamento de recursos entre diferentes origens
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: { policy: "credentialless" }
      } as any)
    );
  }

  // Log do domínio configurado para CORS
  console.info("cors domain ======>>>>", process.env.FRONTEND_URL);

  // Configuração dos middlewares principais
  app.use(cookieParser()); // Parser para cookies
  app.use(json({ limit: "100MB" })); // Parser para JSON com limite de 100MB
  app.use(
    urlencoded({
      extended: true,
      limit: "100MB",
      parameterLimit: 200000
    }) // Parser para dados de formulário com limites
  );

  // Middleware global para tratamento de erros
  // Captura qualquer erro não tratado na aplicação
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Registra o erro no log
    logger.error("Erro ocorrido:", err.message);

    // Retorna resposta de erro
    res.status(500).json({
      message: "Ocorreu um erro interno no servidor",
      // Inclui stack trace apenas em ambiente de desenvolvimento
      stack: process.env.NODE_ENV === "dev" ? err.stack : undefined
    });
  });

  // Log indicando que a configuração do Express foi concluída
  logger.info("express already in server!");
}
