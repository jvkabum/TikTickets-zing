import __init from "./app";
import { logger } from "./utils/logger";
import scheduleClosePendingTicketsJob from './jobs/ClosePendingTicketsJob';

// Inicializa a aplicação principal
__init().then((app: any) => {
    // Inicia o servidor da aplicação
    app.start();
    // Registra no log que o sistema foi iniciado
    logger.info("Started system!!");

    // Inicia o job que fecha automaticamente tickets pendentes
    // Este job verifica periodicamente tickets que precisam ser fechados
    // baseado em regras de negócio como tempo de inatividade
    scheduleClosePendingTicketsJob();
});
