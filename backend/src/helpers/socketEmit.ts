import { getIO } from "../libs/socket";

// Tipos de eventos que podem ser emitidos
type Events =
  | "chat:create"    // Criação de chat
  | "chat:delete"    // Deleção de chat
  | "chat:update"    // Atualização de chat
  | "chat:ack"       // Confirmação de leitura
  | "ticket:update"  // Atualização de ticket
  | "ticket:create"  // Criação de ticket
  | "contact:update" // Atualização de contato
  | "contact:delete" // Deleção de contato
  | "notification:new"; // Nova notificação

// Interface para o objeto de evento
interface ObjEvent {
  tenantId: number | string;  // ID do tenant
  type: Events;              // Tipo do evento
  // eslint-disable-next-line @typescript-eslint/ban-types
  payload: object;           // Dados do evento
}

// Função para emitir eventos via socket.io
// @param tenantId - ID do tenant (empresa/organização)
// @param type - Tipo do evento a ser emitido
// @param payload - Dados a serem enviados com o evento
const emitEvent = ({ tenantId, type, payload }: ObjEvent): void => {
  // Obtém instância do socket.io
  const io = getIO();
  
  // Define o canal do evento
  // Por padrão usa a lista de tickets
  let eventChannel = `${tenantId}:ticketList`;

  // Se for evento relacionado a contatos, usa a lista de contatos
  if (type.indexOf("contact:") !== -1) {
    eventChannel = `${tenantId}:contactList`;
  }

  // Emite o evento para o tenant específico no canal apropriado
  io.to(tenantId.toString()).emit(eventChannel, {
    type,
    payload
  });
};

export default emitEvent;
