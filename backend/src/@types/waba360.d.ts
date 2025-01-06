/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */

// ====================
// Interface para Mensagem de Texto do WABA
// ====================
interface WabaMessageText {
  text: {
    body: string; // Corpo da mensagem de texto
  };
}

// ====================
// Interface para ID da Mensagem
// ====================
interface messageId {
  id: string; // ID da mensagem
}

// ====================
// Interface para Resposta do WABA
// ====================
interface WabaResponse {
  messages: messageId[]; // Lista de IDs das mensagens
}

// ====================
// Interface para Mensagem de Documento do WABA
// ====================
interface WabaMessageDocument {
  caption?: string; // Legenda opcional do documento
  filename?: string; // Nome do arquivo
  id?: string; // ID do documento
  mime_type?: string; // Tipo MIME do documento
  sha256?: string; // Hash SHA256 do documento
}

// ====================
// Interface para Mensagem de Mídia do WABA
// ====================
interface WabaMessageMedia {
  id?: string; // ID da mídia
  caption?: string; // Legenda opcional da mídia
  mime_type?: string; // Tipo MIME da mídia
  sha256?: string; // Hash SHA256 da mídia
}

// ====================
// Interface para Mensagem do WABA
// ====================
interface WabaMessage {
  id?: string; // ID da mensagem
  fromMe?: boolean; // Indica se a mensagem foi enviada pelo usuário
  // eslint-disable-next-line camelcase
  recipient_type: "individual" | "group"; // Tipo de destinatário
  to: string; // Destinatário da mensagem
  type:
  | "text"
  | "voice"
  | "template"
  | "image"
  | "video"
  | "audio"
  | "document"; // Tipo da mensagem
  text?: {
    body: string; // Corpo da mensagem de texto
  };
  video?: WabaMessageMedia; // Mensagem de vídeo
  image?: WabaMessageMedia; // Mensagem de imagem
  document?: WabaMessageDocument; // Mensagem de documento
  audio?: WabaMessageMedia; // Mensagem de áudio
  voice?: WabaMessageMedia; // Mensagem de voz
  timestamp: string; // Timestamp da mensagem
}

// ====================
// Interface para Contato do WABA
// ====================
interface WabaContact {
  profile: {
    name: string; // Nome do contato
  };
  // eslint-disable-next-line camelcase
  wa_id: string; // ID do WhatsApp do contato
}

// ====================
// Interface para Contexto do WABA
// ====================
interface WabaContext {
  messages: WabaMessage[]; // Lista de mensagens
  contacts: WabaContact[]; // Lista de contatos
}
