import __init from "./app";
import { logger } from "./utils/logger";
import scheduleClosePendingTicketsJob from "./jobs/ClosePendingTicketsJob";
import { scheduleConnectionVerification } from "./services/WbotServices/VerifyConnectionService";
import { 
  cleanupAllSessions,
  killChromiumProcesses 
} from "./services/WbotServices/SessionCleanupService";

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
  
  // Aguarda um pouco para garantir que todos os recursos foram liberados
  const startupDelay = 5000; // 5 segundos
  logger.info(`Aguardando ${startupDelay/1000} segundos para garantir que todos os recursos foram liberados...`);
  await new Promise(resolve => setTimeout(resolve, startupDelay));
  
  // Inicia o servidor da aplicação
  app.start();
  // Registra no log que o sistema foi iniciado
  logger.info("Started system!!");

  // Aguarda mais um pouco antes de iniciar os serviços WhatsApp
  const whatsappDelay = 3000; // 3 segundos
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
