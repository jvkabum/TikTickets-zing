/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import "express-async-errors";
import "./config-env";
import { createServer } from "http";
import { env } from "process";
import express from "express";
import GracefulShutdown from "http-graceful-shutdown";
import bootstrap from "./boot"; // A função de bootstrap que você deve ter
import { initIO } from "../libs/socket"; // Inicializa o socket
import { StartAllWhatsAppsSessions } from "../services/WbotServices/StartAllWhatsAppsSessions";
import configureExpress from './express'; // Importa a configuração do Express

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function application() {
  const app: any = express();
  const httpServer: any = createServer(app);
  const port = app.get("port") || env.PORT || 3100;

  // Configura o Express
  await configureExpress(app); // Adiciona configuração do Express
  await bootstrap(app); // Executa o bootstrap

  async function start() {
    const host = app.get("host") || "0.0.0.0";
    app.server = httpServer.listen(port, host, async () => {
      console.info(`Web server listening at: http://${host}:${port}/`);
    });

    initIO(app.server);

    // needs to start after socket is available
    await StartAllWhatsAppsSessions();
    GracefulShutdown(app.server);
  }

  async function close() {
    return new Promise<void>((resolve, reject) => {
      httpServer.close(err => {
        if (err) {
          reject(err);
        }

        resolve();
      });
