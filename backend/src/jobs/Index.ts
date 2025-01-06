// Arquivo central que exporta todos os jobs do sistema
// Cada job é responsável por uma tarefa específica e automatizada

// Job para envio de mensagens em campanhas do WhatsApp
// Gerencia o envio em massa de mensagens para campanhas marketing
export { default as SendMessageWhatsappCampaign } from "./SendMessageWhatsappCampaign";

// Job para envio de mensagens durante horário comercial
// Controla o envio de mensagens respeitando horários configurados
export { default as SendMessageWhatsappBusinessHours } from "./SendMessageWhatsappBusinessHours";

// Job para envio de mensagens via API
// Processa mensagens recebidas através da API externa
export { default as SendMessageAPI } from "./SendMessageAPI";

// Job para envio geral de mensagens
// Gerencia o envio de mensagens do sistema
export { default as SendMessages } from "./SendMessages";

// Job para processamento de webhooks da API
// Gerencia callbacks e notificações externas
export { default as WebHooksAPI } from "./WebHooksAPI";

// Job para verificação de tickets inativos do chatbot
// Monitora e atualiza status de conversas automatizadas
export { default as VerifyTicketsChatBotInactives } from "./VerifyTicketsChatBotInactives";

// Job para envio de mensagens agendadas
// Gerencia o envio de mensagens em horários específicos
export { default as SendMessageSchenduled } from "./SendMessageSchenduled";
