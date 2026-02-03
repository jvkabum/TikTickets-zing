import { Client } from "whatsapp-web.js";

/**
 * Interface estendida do Client do whatsapp-web.js para incluir
 * propriedades de controle específicas do TikTickets-zing.
 */
export interface Session extends Client {
  id: number;
  lastPing?: number;
  monitorInterval?: any;
  checkMessages?: any;
  reconnectionAttempts?: number;
  tenantId: number | string;
  lastConnectionVerification?: number;
  clientId?: number;
  close?: () => void;
  // Propriedade info é obrigatória no Client, garantimos compatibilidade aqui
  info: any;
}
