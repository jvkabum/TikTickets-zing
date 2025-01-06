    import __init from "./app";
    import { logger } from "./utils/logger";
    import scheduleClosePendingTicketsJob from './jobs/ClosePendingTicketsJob'; // Importe a função do job
    
    __init().then((app: any) => {
        app.start();
        logger.info("Started system!!");
    
        // Inicia o job de fechamento automático de tickets
        scheduleClosePendingTicketsJob(); // Chama apenas a função sem o .start()
    });