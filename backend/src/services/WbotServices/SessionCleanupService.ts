import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { spawn } from "child_process";
import { performance } from "perf_hooks";
import { logger } from "../../utils/logger";
import { getWbot, removeWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";

/**
 * Serviço centralizado para limpeza de sessões do WhatsApp (VERSÃO HÍBRIDA ENTERPRISE v4)
 * O ápice da engenharia: 
 * 1. Zero Shell (spawn-only)
 * 2. Telemetria de Performance
 * 3. Sanitização Rigorosa
 * 4. Cross-Platform Ultra Resiliente
 */

type CleanupContext = "manual" | "startup" | "qrcode" | "disconnect";

const AUTH_PATH_ROOT = process.env.WWEBJS_AUTH_PATH || path.resolve(__dirname, "..", "..", "..", ".wwebjs_auth");

// Auxiliar para executar processos via spawn de forma segura (sem shell)
const spawnPromise = (cmd: string, args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(cmd, args);

    child.stdout.on("data", data => (stdout += data.toString()));
    child.stderr.on("data", data => (stderr += data.toString()));

    child.on("close", code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Command ${cmd} exited with code ${code}: ${stderr}`));
    });

    child.on("error", err => reject(err));
  });
};

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class OperationCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60000;

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    if (this.cache.size > 500) this.cleanup();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) this.cache.delete(key);
    }
  }

  clearPathCache(sessionPath: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(sessionPath)) keysToDelete.push(key);
    }
    keysToDelete.forEach(k => this.cache.delete(k));
  }

  async fileExists(filepath: string, ttl: number = 5000): Promise<boolean> {
    const cacheKey = `file_exists:${filepath}`;
    const cachedResult = this.get<boolean>(cacheKey);
    if (cachedResult !== null) return cachedResult;

    try {
      await fs.access(filepath);
      this.set(cacheKey, true, ttl);
      return true;
    } catch {
      this.set(cacheKey, false, ttl);
      return false;
    }
  }
}

const operationCache = new OperationCache();

const validateId = (id: number | string): number => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error(`ID de sessão inválido: ${id}`);
  }
  return numericId;
};

// Kill Global (Cross-Platform via spawn)
export const killChromiumProcesses = async (): Promise<void> => {
  try {
    const start = performance.now();
    logger.info("[v4-PERF] Iniciando scan global de processos chrome...");
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // Uso de PowerShell via spawn (seguro)
      const psArgs = [
        "-Command",
        "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*wwebjs_auth*' -or $_.CommandLine -like '*puppeteer*'} | Stop-Process -Force"
      ];
      try {
        await spawnPromise("powershell", psArgs);
        logger.info("[v4-PERF] PowerShell encerrou processos globais.");
      } catch (e) {
        logger.debug(`[v4-PERF] Sem processos globais ou erro esperado: ${e.message}`);
      }
    } else {
      try {
        await spawnPromise("pkill", ["-f", "wwebjs_auth/session-wbot"]);
        logger.info("[v4-PERF] Pkill executado com sucesso (Unix).");
      } catch {
        try {
          await spawnPromise("pkill", ["-9", "-f", "wwebjs_auth/session-wbot"]);
        } catch { }
      }
    }
    const end = performance.now();
    logger.info(`[v4-PERF] Kill global concluído em ${(end - start).toFixed(2)}ms`);
  } catch (error) {
    logger.error(`Erro killChromiumProcesses: ${error}`);
  }
};

export const cleanupWbotSession = async (
  idRaw: number | string,
  context: CleanupContext = "manual",
  whatsappModel?: Whatsapp | null
): Promise<void> => {
  const start = performance.now();
  try {
    const whatsappId = validateId(idRaw);
    logger.info(`[v4-PERF] Ciclo Limpeza ${whatsappId} | Contexto: ${context}`);

    const whatsapp = whatsappModel || await Whatsapp.findByPk(whatsappId);

    await removeSessionFromMemory(whatsappId);

    if (!whatsapp || whatsapp.status === "DISCONNECTED" || context === "qrcode" || context === "startup") {
      await cleanupSessionFiles(whatsappId, context, whatsapp);
    }

    const activeSessions = await Whatsapp.count({ where: { status: "CONNECTED" } });
    if (activeSessions === 0) await killChromiumProcesses();

    const end = performance.now();
    logger.info(`[v4-PERF] Ciclo completo ${whatsappId} finalizado em ${(end - start).toFixed(2)}ms`);
  } catch (error) {
    logger.error(`Erro cleanupWbotSession: ${error.message}`);
  }
};

const removeSessionFromMemory = async (whatsappId: number): Promise<void> => {
  try {
    // Tenta obter a sessão apenas para limpeza, mas não falha se não existir
    try {
      const wbot = getWbot(whatsappId);
      if (wbot) {
        if (wbot.monitorInterval) clearInterval(wbot.monitorInterval);
        if (wbot.checkMessages) clearInterval(wbot.checkMessages);
        try { await wbot.destroy(); } catch { }
      }
    } catch {
      // Ignora erro se sessão não existir (comum durante limpeza)
    }

    await removeWbot(whatsappId);
  } catch (err) {
    // Log melhorado para evitar [object Object]
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Erro removeSessionFromMemory ${whatsappId}: ${errorMessage}`);
  }
};

export const cleanupSessionFiles = async (
  idRaw: number | string,
  context: CleanupContext = "manual",
  whatsappModel?: Whatsapp | null
): Promise<void> => {
  try {
    const whatsappId = validateId(idRaw);
    const pathSession = path.join(AUTH_PATH_ROOT, `session-wbot-${whatsappId}`);
    const whatsapp = whatsappModel || await Whatsapp.findByPk(whatsappId);

    if (context !== "startup" && context !== "qrcode" && whatsapp?.status === "CONNECTED") {
      logger.info(`[v4-PERF] Sessão ${whatsappId} ativa. Ignorando arquivos.`);
      return;
    }

    if (!await operationCache.fileExists(pathSession)) return;

    await killSessionChromiumProcesses(whatsappId);
    await new Promise(r => setTimeout(r, 500)); // Aumentado para 500ms para Windows liberar travas
    await removeLockFiles(pathSession);
    await new Promise(r => setTimeout(r, 200));

    // No boot (startup), NUNCA apagamos a pasta da sessão, apenas limpamos processos e travas
    if (context === "startup") {
      logger.info(`[v4-PERF] Boot: Preservando pasta de sessão ${whatsappId} para reconexão automática.`);
      return;
    }

    // Tentativa de remoção com retentativa para evitar EBUSY
    let retries = 0;
    const maxRetries = 2;
    while (retries <= maxRetries) {
      try {
        await fs.rm(pathSession, { recursive: true, force: true });
        operationCache.clearPathCache(pathSession);
        logger.info(`[v4-PERF] Pasta removida com sucesso: ${pathSession}`);
        break;
      } catch (e) {
        retries++;
        if (retries > maxRetries) {
          logger.warn(`[v4-PERF] Falha ao remover pasta ${pathSession} após ${maxRetries} tentativas. Usando limpeza agressiva operacional.`);
          await alternativeCleanup(pathSession);
        } else {
          logger.info(`[v4-PERF] Recurso ocupado (EBUSY), tentando novamente em 500ms... (${retries}/${maxRetries})`);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  } catch (error) {
    logger.error(`Erro cleanupSessionFiles: ${error.message}`);
  }
};

export async function killSessionChromiumProcesses(idRaw: number | string): Promise<void> {
  const whatsappId = validateId(idRaw);
  const sessionPattern = `session-wbot-${whatsappId}`;

  try {
    if (process.platform === "win32") {
      // WMIC via spawn (Array de argumentos evita shell)
      // Nota: WMIC foi descontinuado no Windows 11 e pode não estar disponível
      const wmicArgs = ["process", "where", `name='chrome.exe' and commandline like '%${sessionPattern}%'`, "call", "terminate"];
      try {
        await spawnPromise("wmic", wmicArgs);
        logger.info(`[v4-PERF] WMIC cirúrgico matou processos ${whatsappId}`);
      } catch (e) {
        // WMIC não disponível (Windows 11+) ou sem processos - usar PowerShell
        logger.debug(`[v4-PERF] WMIC não disponível, usando PowerShell como método principal`);
        const psCmd = `Get-Process chrome -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like '*${sessionPattern}*'} | Stop-Process -Force`;
        try {
          await spawnPromise("powershell", ["-Command", psCmd]);
          logger.info(`[v4-PERF] PowerShell executado com sucesso para sessão ${whatsappId}`);
        } catch (psError) {
          // Sem processos para matar - isso é normal
          logger.debug(`[v4-PERF] Nenhum processo Chrome encontrado para sessão ${whatsappId}`);
        }
      }
    } else {
      try {
        await spawnPromise("pkill", ["-f", sessionPattern]);
      } catch {
        try { await spawnPromise("pkill", ["-9", "-f", sessionPattern]); } catch { }
      }
    }
  } catch { }
}

export const forceCleanupBeforeQrCode = async (idRaw: number | string): Promise<void> => {
  const whatsappId = validateId(idRaw);
  logger.info(`[v4-PERF] Forced Pre-QR Cleanup: ${whatsappId}`);
  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (whatsapp) {
    await whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
  }
  await cleanupWbotSession(whatsappId, "qrcode", whatsapp);
};

const removeLockFiles = async (sessionPath: string): Promise<void> => {
  try {
    const defaultDir = path.join(sessionPath, "Default");
    const locks = [
      path.join(sessionPath, "SingletonLock"),
      path.join(defaultDir, "LOCK"),
      path.join(defaultDir, "Network/Cookies.lock"),
      path.join(defaultDir, "DevToolsActivePort")
    ];

    for (const lock of locks) {
      if (await operationCache.fileExists(lock)) {
        try {
          await fs.unlink(lock);
        } catch {
          // Fallback via spawn para comandos de sistema
          try {
            if (process.platform === "win32") {
              await spawnPromise("cmd", ["/c", "del", "/F", "/Q", lock.replace(/\//g, "\\")]);
            } else {
              await spawnPromise("rm", ["-f", lock]);
            }
          } catch { }
        }
      }
    }
  } catch { }
};

const alternativeCleanup = async (sessionPath: string): Promise<void> => {
  try {
    if (process.platform === "win32") {
      await spawnPromise("cmd", ["/c", "rmdir", "/S", "/Q", sessionPath.replace(/\//g, "\\")]);
    } else {
      await spawnPromise("rm", ["-rf", sessionPath]);
    }
    logger.info(`[v4-PERF] Limpeza agressiva (spawn) concluída para ${sessionPath}`);
  } catch (e) {
    logger.error(`[v4-PERF] Limpeza alternativa falhou: ${e.message}`);
  }
};

export const updateWhatsappStatus = async (
  whatsappId: number,
  status: string,
  qrcode: string = "",
  retries: number = 0
): Promise<void> => {
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) return;
    await whatsapp.update({ status, qrcode, retries });
    getIO().emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp
    });
  } catch (e) {
    logger.error(`[v4-PERF] Erro updateWhatsappStatus ${whatsappId}: ${e.message}`);
  }
};

export const cleanupAllSessions = async (): Promise<void> => {
  try {
    await killChromiumProcesses();
    if (!await operationCache.fileExists(AUTH_PATH_ROOT)) return;

    const folders = await fs.readdir(AUTH_PATH_ROOT);
    for (const folder of folders) {
      if (folder.startsWith("session-wbot-")) {
        const id = folder.replace("session-wbot-", "");
        await cleanupSessionFiles(id, "startup");
      }
    }
  } catch { }
};

export const initSessionCleanupService = (): void => {
  cleanupAllSessions();
  setInterval(() => operationCache.cleanup(), 300000);
  logger.info("[ENTERPRISE] SessionCleanupService v4 (Ultra-Security Spawn Engine)");
};
