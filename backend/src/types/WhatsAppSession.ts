import { Client } from "whatsapp-web.js";

export interface Session extends Client {
  id: number;
  lastPing?: number;
  monitorInterval?: NodeJS.Timeout;
  checkMessages?: NodeJS.Timeout;
  reconnectionAttempts?: number;
  lastConnectionVerification?: number;
}
