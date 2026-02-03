import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// INICIALIZAÇÃO CRÍTICA DO SENTRY (DEVE SER O PRIMEIRO CÓDIGO A EXECUTAR)
const SENTRY_DSN = process.env.SENTRY_DSN || "https://362610dc5ab76bba5e2c3db07dfda11e@o4510819566485504.ingest.us.sentry.io/4510822953058304";
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
    // Enable logs to be sent to Sentry
    enableLogs: true,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    sendDefaultPii: true,
    environment: process.env.NODE_ENV || "development",
  });
  console.log("[Sentry] Inicializado com logs e prioridade máxima no server.ts");
}

import __init from "./app";
import scheduleClosePendingTicketsJob from "./jobs/ClosePendingTicketsJob";
import {
  cleanupAllSessions,
  killChromiumProcesses
} from "./services/WbotServices/SessionCleanupService";
import { scheduleConnectionVerification } from "./services/WbotServices/VerifyConnectionService";
import "./telemetry"; // OTel SDK vem em seguida
import { logger } from "./utils/logger";

// Função para limpar recursos antes de iniciar o servidor
const limparRecursosAntigos = async (): Promise<void> => {
  try {
    logger.info("Limpando recursos antigos antes de iniciar...");

    // Usa os serviços centralizados para limpeza completa
    // Primeiro, mata processos chrome abandonados
    await killChromiumProcesses();

    // Em seguida, limpa todas as sessões e arquivos de bloqueio
    // Esta função agora contém toda a lógica de limpeza de arquivos
    await cleanupAllSessions();

    logger.info("Limpeza de recursos concluída");
  } catch (error) {
    logger.error(`Erro durante limpeza de recursos: ${error}`);
  }
};

// Inicializa a aplicação principal
__init().then(async (app: any) => {
  // Limpa recursos antigos antes de iniciar
  await limparRecursosAntigos();

  // Aguarda o mínimo necessário para garantir que todos os recursos foram liberados
  const startupDelay = 1000; // Reduzido de 5s para 1s
  logger.info(`Aguardando ${startupDelay / 1000}s para estabilização de recursos...`);
  await new Promise(resolve => setTimeout(resolve, startupDelay));

  // Inicia o servidor da aplicação
  app.start();
  // Registra no log que o sistema foi iniciado
  logger.info("Started system!!");

  // Pequeno delay para evitar picos de CPU no boot
  const whatsappDelay = 500; // Reduzido de 3s para 0.5s
  await new Promise(resolve => setTimeout(resolve, whatsappDelay));
  logger.info("Iniciando serviços do WhatsApp...");

  // Inicia o job que fecha automaticamente tickets pendentes
  // Este job verifica periodicamente tickets que precisam ser fechados
  // baseado em regras de negócio como tempo de inatividade
  scheduleClosePendingTicketsJob();

  // Inicia o serviço de verificação de conexões WhatsApp
  // Este serviço verifica periodicamente se as conexões estão realmente ativas
  // e tenta reconectar automaticamente quando necessário
  scheduleConnectionVerification();
  logger.info("Serviço de verificação de conexões WhatsApp iniciado");
});
