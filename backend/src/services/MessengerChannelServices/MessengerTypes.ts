// Exporta tipos base da biblioteca messaging-api-messenger
export * from "messaging-api-messenger/dist/MessengerTypes";

// Tipos que definem a estrutura de eventos do Messenger
// Cada tipo representa uma parte específica das mensagens e interações

// Define o remetente de um evento
// Contém o ID único do usuário que enviou a mensagem
export type EventSender = {
  id: string;
};

// Define o destinatário de um evento
// Contém o ID único da página que recebeu a mensagem
export type EventRecipient = {
  id: string;
};

// Define a estrutura de respostas rápidas
// Usado quando o usuário seleciona uma opção pré-definida
export type EventMessageQuickReply = {
  payload: string;
};

// Define a estrutura de anexos de mídia
// Contém a URL do arquivo de mídia enviado
export type MediaAttachmentPayload = {
  url: string;
};

// Define a estrutura de anexos de localização
// Contém as coordenadas geográficas compartilhadas
export type LocationAttachmentPayload = {
  coordinates: {
    lat: number;
    long: number;
  };
};

// Define a estrutura de anexos não suportados
// Usado quando o tipo de anexo não pode ser processado normalmente
export type FallbackAttachment = {
  type: "fallback";
  payload: null;
  title: string;
  URL: string;
};

// Define os tipos possíveis de anexos em mensagens
// Inclui mídia, localização e anexos não suportados
export type EventMessageAttachment =
  | {
    type: "audio" | "video" | "image" | "file";
    payload: MediaAttachmentPayload;
  }
  | {
    type: "location";
    payload: LocationAttachmentPayload;
  }
  | FallbackAttachment;

// Define tags associadas a mensagens
// Usado para categorizar ou marcar mensagens
type EventMessageTag = {
  source: string;
};

// Define a estrutura de respostas a mensagens
// Usado quando uma mensagem é uma resposta a outra
type EventMessageReplyTo = {
  mid: string;
};

// Define a estrutura completa de uma mensagem
// Inclui todos os possíveis campos que uma mensagem pode ter
export type EventMessage = {
  mid: string;
  isEcho?: boolean;
  text?: string;
  stickerId?: number;
  quickReply?: EventMessageQuickReply;
  attachments?: EventMessageAttachment[];
  tags?: EventMessageTag[];
  replyTo?: EventMessageReplyTo;
  appId?: number;
  metadata?: string;
};

// Define a estrutura de confirmação de entrega de mensagens
// Inclui IDs das mensagens entregues e timestamp do último recebimento
export type EventDelivery = {
  mids: string[];
  watermark: number;
};

// Define a estrutura de confirmação de leitura de mensagens
// Indica até qual momento as mensagens foram lidas
export type EventRead = {
  watermark: number;
};

// Define a estrutura de eventos de referência
// Usado para rastrear origem e tipo de interação
export type EventReferral = {
  ref: string;
  source: string;
  type: string;
  originDomain?: string;
};

// Define a estrutura de postbacks
// Usado quando usuário interage com botões ou menus
export type EventPostback = {
  title: string;
  payload?: string;
  referral?: EventReferral;
};

// Define a estrutura de eventos de jogos
// Usado para interações com jogos do Messenger
export type EventGamePlay = {
  gameId: string;
  playerId: string;
  contextType: "SOLO" | "THREAD" | "GROUP";
  contextId: string;
  score: number;
  payload: string;
};

// Define a estrutura de eventos de opt-in
// Usado para permissões e notificações
export type EventOptin =
  | {
    ref: string;
    userRef?: string;
  }
  | {
    type: "one_time_notif_req";
    payload: string;
    oneTimeNotifToken: string;
  };

// Define a estrutura de eventos de pagamento
// Contém informações sobre transações financeiras
export type EventPayment = {
  payload: string;
  requestedUserInfo: Record<string, any>;
  paymentCredential: Record<string, any>;
  amount: {
    currency: string;
    amount: string;
  };
  shippingOptionId: string;
};

// Define a estrutura de atualizações de checkout
// Usado para atualizações durante processo de compra
export type EventCheckoutUpdate = {
  payload: string;
  shippingAddress: {
    id: number;
    street1: string;
    street2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
};

// Define a estrutura de eventos pré-checkout
// Contém informações antes da finalização da compra
export type EventPreCheckout = {
  payload: string;
  requestedUserInfo: {
    shippingAddress: {
      name: string;
      street1: string;
      street2: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    contactName: string;
  };
  amount: {
    currency: string;
    amount: string;
  };
};

// Define a estrutura de eventos de política
// Usado para ações de conformidade e moderação
export type EventPolicyEnforcement = {
  action: string;
  reason: string;
};

// Define os papéis do aplicativo
// Mapeia funções disponíveis para o app
export type EventAppRoles = Record<string, string[]>;

// Define a estrutura de transferência de controle
// Usado quando o controle da conversa é passado para outro app
export type EventPassThreadControl = {
  newOwnerAppId: string;
  metadata: string;
};

// Define a estrutura de tomada de controle
// Usado quando um app assume o controle da conversa
export type EventTakeThreadControl = {
  previousOwnerAppId: string;
  metadata: string;
};

// Define a estrutura de solicitação de controle
// Usado quando um app solicita controle da conversa
export type EventRequestThreadControl = {
  requestedOwnerAppId: number;
  metadata: string;
};

// Define a estrutura de eventos de câmera personalizada
// Usado para recursos de câmera específicos da marca
export type EventBrandedCamera = {
  contentIds: string[];
  event: string;
};

// Define a estrutura de vinculação de conta
// Usado para conectar ou desconectar contas externas
export type EventAccountLinking =
  | { status: "linked"; authorizationCode: string }
  | { status: "unlinked" };

// Define a estrutura de reações a mensagens
// Usado para reações com emojis em mensagens
export type EventReaction = {
  reaction:
  | "smile"
  | "angry"
  | "sad"
  | "wow"
  | "love"
  | "like"
  | "dislike"
  | "other";
  emoji: string;
  action: "react" | "unreact";
  mid: string;
};

// Define a estrutura completa de eventos do Messenger
// União de todos os tipos possíveis de eventos
export type MessengerRawEvent =
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    message: EventMessage;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    delivery: EventDelivery;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    read: EventRead;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    postback: EventPostback;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    accountLinking: EventAccountLinking;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    gamePlay: EventGamePlay;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    optin: EventOptin;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    referral: EventReferral;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    payment: EventPayment;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    checkoutUpdate: EventCheckoutUpdate;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    preCheckout: EventPreCheckout;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    passThreadControl: EventPassThreadControl;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    takeThreadControl: EventTakeThreadControl;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    requestThreadControl: EventRequestThreadControl;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    brandedCamera: EventBrandedCamera;
  }
  | {
    sender: EventSender;
    recipient: EventRecipient;
    timestamp: number;
    reaction: EventReaction;
  }
  | {
    recipient: EventRecipient;
    timestamp: number;
    appRoles: EventAppRoles;
  }
  | {
    recipient: EventRecipient;
    timestamp: number;
    "policy-enforcement": EventPolicyEnforcement;
  };

// Define opções adicionais para eventos do Messenger
// Configurações que afetam o processamento de eventos
export type MessengerEventOptions = {
  isStandby?: boolean;
  pageId?: string | null;
};

// Define a estrutura de entrada de mensagens
// Representa uma entrada no webhook do Messenger
export type MessagingEntry =
  | {
    id: string;
    time: number;
    messaging: MessengerRawEvent[];
  }
  | {
    id: string;
    time: number;
    // Supported Events: message_reads, message_deliveries, messages, messaging_postbacks
    standby: (
      | {
        sender: EventSender;
        recipient: EventRecipient;
        timestamp: number;
        message: EventMessage;
      }
      | {
        sender: EventSender;
        recipient: EventRecipient;
        timestamp: number;
        delivery: EventDelivery;
      }
      | {
        sender: EventSender;
        recipient: EventRecipient;
        timestamp: number;
        read: EventRead;
      }
      | {
        sender: EventSender;
        recipient: EventRecipient;
        timestamp: number;
        postback: EventPostback;
      }
    )[];
  };

// Define a estrutura completa do corpo da requisição
// Formato padrão das requisições recebidas do Messenger
export type MessengerRequestBody = {
  object: "page";
  entry: MessagingEntry[];
};
