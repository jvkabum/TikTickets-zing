// src/app/index.ts

/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import "express-async-errors";
import "./config-env";
import { createServer } from "http";
import { env } from "process";
import express from "express";
import GracefulShutdown from "http-graceful-shutdown";
import bootstrap from "./boot";
import { initIO } from "../libs/socket";
import { StartAllWhatsAppsSessions } from "../services/WbotServices/StartAllWhatsAppsSessions";
import configureExpress from './express';

// Função principal que inicializa toda a aplicação
export default async function application() {
  // Cria a instância do Express e do servidor HTTP
  const app: any = express();
  const httpServer: any = createServer(app);
  // Define a porta do servidor, usando variável de ambiente ou 3100 como padrão
  const port = app.get("port") || env.PORT || 3100;

  // Configura o Express com middlewares e rotas
  await configureExpress(app);
  // Inicializa serviços essenciais como banco de dados e filas
  await bootstrap(app);

  // Função que inicia o servidor web
  async function start() {
    // Define o host, usando 0.0.0.0 como padrão para aceitar conexões de qualquer origem
    const host = app.get("host") || "0.0.0.0";
    // Inicia o servidor HTTP na porta e host definidos
    app.server = httpServer.listen(port, host, async () => {
      console.info(`Web server listening at: http://${host}:${port}/`);
    });

    // Inicializa o Socket.IO para comunicação em tempo real
    initIO(app.server);

    // Inicia todas as sessões do WhatsApp após o socket estar disponível
    await StartAllWhatsAppsSessions();
    // Configura o desligamento gracioso do servidor
    GracefulShutdown(app.server);
  }

  // Função para fechar o servidor de forma controlada
  async function close() {
    return new Promise<void>((resolve, reject) => {
      httpServer.close(err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  // Configura o tratamento do sinal SIGTERM para fechamento controlado
  process.on("SIGTERM", close);

  // Adiciona as funções start e close à instância do app
  app.start = start;
  app.close = close;

  return app;
}
