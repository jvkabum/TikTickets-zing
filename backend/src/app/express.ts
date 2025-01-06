import "reflect-metadata"; // Importa metadados para TypeScript
import "express-async-errors"; // Para tratar erros assíncronos
import { Application, json, urlencoded, Request, Response, NextFunction } from "express"; // Importa módulos do Express
import cors from "cors"; // Middleware para CORS
import cookieParser from "cookie-parser"; // Middleware para manipulação de cookies
import helmet from "helmet"; // Middleware para segurança
import { logger } from "../utils/logger"; // Importa o logger

export default async function express(app: Application): Promise<void> {
  const origin = [process.env.FRONTEND_URL || "https://app.tikanais.com.br"];
  // Configuração do CORS
  app.use(
    cors({
      origin,
      credentials: true // Permite cookies e cabeçalhos de autenticação
    })
  );

  // Configurações de segurança se não estiver no ambiente de desenvolvimento
  if (process.env.NODE_ENV !== "dev") {
    app.use(helmet());
    
    // Configuração da política de segurança de conteúdo
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
    // Adiciona políticas de recursos cruzados
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: { policy: "credentialless" }
      } as any)
    );
  }

  console.info("cors domain ======>>>>", process.env.FRONTEND_URL); // Log do domínio CORS

  // Configuração de middleware
  app.use(cookieParser());
  app.use(json({ limit: "100MB" })); // Limite para o corpo JSON
  app.use(
    urlencoded({ extended: true, limit: "100MB", parameterLimit: 200000 }) // Limite para dados URL-encoded
  );

  // Middleware de tratamento de erros
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error("Erro ocorrido:", err.message); // Log do erro
    res.status(500).json({
      message: "Ocorreu um erro interno no servidor",
      stack: process.env.NODE_ENV === "dev" ? err.stack : undefined // Inclui o stack trace para depuração, se não estiver em produção
    });
  });
  logger.info("express already in server!"); // Log para indicar que o Express foi configurado
}