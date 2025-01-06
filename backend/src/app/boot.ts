import { Application } from "express";
import database from "./database";
import modules from "./modules";
import express from "./express";
import bullMQ from "./bull";
import waitForPostgresConnection from "./awaitPostgresConnection";

// Função de inicialização (bootstrap) da aplicação
// Esta função é responsável por inicializar todos os componentes principais
// do sistema em uma ordem específica e controlada
export default async function bootstrap(app: Application): Promise<void> {
  // Aguarda a conexão com o PostgreSQL estar disponível
  // Isso garante que o banco de dados esteja pronto antes de continuar
  await waitForPostgresConnection();

  // Configura o Express com middlewares, rotas e configurações de segurança
  await express(app);

  // Inicializa a conexão com o banco de dados e sincroniza os modelos
  await database(app);

  // Carrega os módulos da aplicação (rotas, controladores, etc)
  await modules(app);

  // Inicializa o sistema de filas BullMQ
  // Necessário para o funcionamento dos bots e processamento assíncrono
  await bullMQ(app);
}
