// Declarações de tipos globais para resolver erros de importação

declare module "./app" {
  const init: any;
  export default init;
}

declare module "./utils/logger" {
  export const logger: {
    info: (message: string) => void;
    error: (message: string | Error) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
  };
}

declare module "./jobs/ClosePendingTicketsJob" {
  const scheduleClosePendingTicketsJob: () => void;
  export default scheduleClosePendingTicketsJob;
}

declare module "./services/WbotServices/VerifyConnectionService" {
  export const scheduleConnectionVerification: () => any;
  export const verifyWhatsAppConnection: (whatsappId: number | string) => Promise<boolean>;
  export const verifyAllWhatsAppConnections: () => Promise<void>;
}

// Adicione quaisquer outras declarações de módulos necessárias aqui 