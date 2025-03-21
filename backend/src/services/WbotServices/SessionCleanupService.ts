import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { rm } from "fs/promises";

import { logger } from "../../utils/logger";
import { getWbot, removeWbot } from "../../libs/wbot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";

/**
 * Serviço centralizado para limpeza de sessões do WhatsApp
 * Todas as operações de limpeza devem ser realizadas através deste serviço
 */

// Sistema de cache para operações frequentes
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class OperationCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60000; // 1 minuto em milissegundos
  
  // Armazena um valor no cache com uma chave específica
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    
    // Remover entradas expiradas a cada 500 entradas para evitar crescimento descontrolado
    if (this.cache.size > 500) {
      this.cleanup();
    }
  }
  
  // Recupera um valor do cache se estiver válido
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verifica se o cache expirou
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  // Remove entradas expiradas do cache
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  // Limpa completamente o cache
  clear(): void {
    this.cache.clear();
  }
  
  // Verifica a existência de um arquivo com cache
  async fileExists(filepath: string, ttl: number = 5000): Promise<boolean> {
    const cacheKey = `file_exists:${filepath}`;
    
    // Tenta obter do cache primeiro
    const cachedResult = this.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }
    
    // Se não estiver em cache, verifica o sistema de arquivos
    const exists = fs.existsSync(filepath);
    this.set(cacheKey, exists, ttl);
    
    return exists;
  }
  
  // Executa um comando com cache de resultado
  async execCommand(command: string, ttl: number = 10000): Promise<string> {
    const cacheKey = `exec:${command}`;
    
    // Tenta obter do cache primeiro
    const cachedResult = this.get<string>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }
    
    // Se não estiver em cache, executa o comando
    const execPromise = promisify(exec);
    try {
      const { stdout } = await execPromise(command);
      this.set(cacheKey, stdout, ttl);
      return stdout;
    } catch (error) {
      // Em caso de erro, armazena uma string vazia com TTL reduzido
      this.set(cacheKey, "", Math.min(ttl / 2, 2000));
      throw error;
    }
  }
}

// Instância global do cache
const operationCache = new OperationCache();

// Função para matar processos do Puppeteer/Chrome relacionados ao WhatsApp
export const killChromiumProcesses = async (): Promise<void> => {
  try {
    logger.info("Procurando por processos Chrome abandonados...");
    
    // Verifica o sistema operacional
    const isWindows = process.platform === "win32";
    const isLinux = process.platform === "linux";
    const isMac = process.platform === "darwin";
    
    const execPromise = promisify(exec);
    
    if (isWindows) {
      // No Windows, usa taskkill
      try {
        // Usando o cache para evitar execuções repetidas em curto intervalo
        await operationCache.execCommand('taskkill /F /IM "chrome.exe" /FI "WINDOWTITLE eq *wwebjs_auth*"', 30000);
        logger.info("Processos chrome relacionados ao WhatsApp foram encerrados no Windows");
      } catch {
        logger.info("Nenhum processo chrome encontrado ou erro ao tentar matar processos no Windows");
      }
      
      // Também tenta matar processos puppeteer específicos
      try {
        await operationCache.execCommand('taskkill /F /IM "chrome.exe" /FI "COMMANDLINE eq *puppeteer*"', 30000);
        logger.info("Processos puppeteer encerrados no Windows");
      } catch {
        // Silenciando erros aqui
      }
    } else if (isLinux) {
      // No Linux
      try {
        await operationCache.execCommand('pkill -f "wwebjs_auth/session-wbot"', 30000);
        logger.info("Processos chrome relacionados ao WhatsApp foram encerrados no Linux");
      } catch {
        logger.info("Nenhum processo chrome encontrado ou erro ao tentar matar processos no Linux");
      }
      
      // Também tenta matar processos puppeteer específicos
      try {
        await operationCache.execCommand('pkill -f "puppeteer"', 30000);
        logger.info("Processos puppeteer encerrados no Linux");
      } catch {
        // Silenciando erros aqui
      }
    } else if (isMac) {
      // No macOS
      try {
        await operationCache.execCommand('pkill -f "wwebjs_auth/session-wbot"', 30000);
        logger.info("Processos chrome relacionados ao WhatsApp foram encerrados no macOS");
      } catch {
        logger.info("Nenhum processo chrome encontrado ou erro ao tentar matar processos no macOS");
      }
      
      try {
        await operationCache.execCommand('pkill -f "puppeteer"', 30000);
        logger.info("Processos puppeteer encerrados no macOS");
      } catch {
        // Silenciando erros aqui
      }
    } else {
      logger.info(`Sistema operacional ${process.platform} não suportado para limpeza de processos chrome`);
    }
  } catch (error) {
    logger.error(`Erro ao tentar matar processos chrome: ${error}`);
  }
};

// Função principal para limpar completamente uma sessão
export const cleanupWbotSession = async (
  whatsappId: number | string
): Promise<void> => {
  logger.info(`Iniciando limpeza completa da sessão: ${whatsappId}`);
  
  try {
    // Verifica se a sessão está realmente desconectada antes de limpar
    const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
    
    // 1. Remover a sessão da memória (se existir)
    await removeSessionFromMemory(whatsappId);
    
    // 2. Limpar todos os arquivos da sessão apenas se a sessão estiver desconectada
    if (!whatsapp || whatsapp.status === "DISCONNECTED") {
      logger.info(`Sessão ${whatsappId} desconectada. Limpando arquivos...`);
      await cleanupSessionFiles(whatsappId);
    } else {
      logger.info(`Sessão ${whatsappId} ainda ativa (${whatsapp.status}). Mantendo arquivos de sessão.`);
    }
    
    // 3. Matar processos chrome relacionados apenas se não houver outras sessões ativas
    const activeSessions = await Whatsapp.count({
      where: {
        status: "CONNECTED"
      }
    });
    
    if (activeSessions === 0) {
      logger.info("Nenhuma sessão ativa. Matando processos do Chromium...");
      await killChromiumProcesses();
    } else {
      logger.info(`${activeSessions} sessões ainda ativas. Mantendo processos do Chromium.`);
    }
    
    logger.info(`Limpeza da sessão ${whatsappId} finalizada com sucesso`);
  } catch (error) {
    logger.error(`Erro durante limpeza completa da sessão ${whatsappId}: ${error}`);
  }
};

// Remove a sessão da memória (lista de sessões ativas)
const removeSessionFromMemory = async (
  whatsappId: number | string
): Promise<void> => {
  try {
    // Tentar obter a sessão atual
    try {
      const wbot = getWbot(Number(whatsappId));
      
      if (wbot) {
        logger.info(`Destruindo sessão ${whatsappId} da memória`);
        
        // Limpar intervalos para evitar vazamento de memória
        if (wbot.monitorInterval) clearInterval(wbot.monitorInterval);
        if (wbot.checkMessages) clearInterval(wbot.checkMessages);
        
        try {
          // Tentar destruir a sessão adequadamente
          await wbot.destroy();
          logger.info(`Sessão ${whatsappId} destruída com sucesso`);
        } catch (destroyErr) {
          logger.error(`Erro ao destruir sessão ${whatsappId}: ${destroyErr}`);
        }
      } else {
        logger.info(`Sessão ${whatsappId} não encontrada na memória`);
      }
    } catch (botError) {
      logger.error(`Erro ao obter bot para sessão ${whatsappId}: ${botError}`);
    }
    
    // Remover a sessão da lista global (isso ocorre na função removeWbot)
    await removeWbot(Number(whatsappId));
  } catch (err) {
    logger.error(`Erro ao remover sessão ${whatsappId} da memória: ${err}`);
  }
};

// Limpa todos os arquivos relacionados à sessão
export const cleanupSessionFiles = async (
  whatsappId: number | string,
  forceCleanup: boolean = false
): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", "..", ".wwebjs_auth");
  const pathSession = `${pathRoot}/session-wbot-${whatsappId}`;
  
  try {
    // Verificamos se a limpeza está sendo forçada (durante reinício do servidor ou geração de QR)
    if (!forceCleanup) {
      // Verificação adicional para não apagar pastas a menos que seja reinício ou QR code
      const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
      
      // Obtém o stack trace para identificar quem chamou esta função
      const stackTrace = new Error().stack || "";
      const isServerStarting = stackTrace.includes("initSessionCleanupService");
      const isGeneratingQrCode = stackTrace.includes("WhatsAppSessionController") || 
                                stackTrace.includes("RequestNewQrCode");
      
      // Só permite limpeza se estiver desconectado E for chamado pelo reinício do servidor
      // OU se estiver gerando um novo QR code
      if (!isServerStarting && !isGeneratingQrCode && 
          (!whatsapp || whatsapp.status !== "DISCONNECTED")) {
        logger.info(`Sessão ${whatsappId} - Limpeza de arquivos ignorada: não é reinício do servidor nem geração de QR code`);
        return;
      }
      
      if (whatsapp && whatsapp.status === "CONNECTED") {
        logger.info(`Sessão ${whatsappId} está CONNECTED. Não removendo arquivos para evitar perda de dados.`);
        return;
      }
    } else {
      logger.info(`Limpeza forçada da sessão ${whatsappId} solicitada explicitamente`);
    }
    
    logger.info(`Limpando arquivos da sessão: ${pathSession}`);
    
    // Verifica se a pasta existe usando o cache
    if (!await operationCache.fileExists(pathSession, 2000)) {
      logger.info(`Pasta da sessão não encontrada: ${pathSession}`);
      return;
    }
    
    // Primeiro, mata qualquer processo Chrome ligado a esta sessão
    await killSessionChromiumProcesses(whatsappId);
    
    // Pequena pausa para garantir que os processos foram mortos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Primeiro, remove arquivos de bloqueio críticos
    await removeLockFiles(pathSession);
    
    // Pequena pausa para garantir que os recursos foram liberados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verifica novamente o status da sessão antes de remover a pasta
    const whatsappAtualizado = await Whatsapp.findByPk(Number(whatsappId));
    if (whatsappAtualizado && whatsappAtualizado.status === "CONNECTED" && !forceCleanup) {
      logger.info(`Sessão ${whatsappId} conectou durante a limpeza. Abortando remoção de pasta.`);
      return;
    }
    
    // Tenta remover recursivamente toda a pasta da sessão
    try {
      await rm(pathSession, { recursive: true, force: true });
      
      // Limpa cache relacionado a esta sessão
      const sessionKeyPrefix = `file_exists:${pathSession}`;
      operationCache.clear(); // Para simplificar, limpamos todo o cache
      
      logger.info(`Pasta da sessão removida: ${pathSession}`);
    } catch (rmError) {
      logger.error(`Erro ao remover pasta da sessão: ${rmError}`);
      
      // Tenta uma abordagem alternativa em caso de falha (especialmente para Windows)
      await alternativeCleanup(pathSession);
    }
  } catch (error) {
    logger.error(`Erro ao limpar arquivos da sessão ${whatsappId}: ${error}`);
  }
};

// Função específica para matar processos do Chrome relacionados a uma sessão específica
export async function killSessionChromiumProcesses(whatsappId: number | string): Promise<void> {
  try {
    logger.info(`Matando processos Chrome específicos para sessão ${whatsappId}...`);
    
    const sessionPattern = `session-wbot-${whatsappId}`;
    
    // Verifica o sistema operacional
    const isWindows = process.platform === "win32";
    const isLinux = process.platform === "linux";
    const isMac = process.platform === "darwin";
    
    const execPromise = promisify(exec);
    
    if (isWindows) {
      // No Windows, usa taskkill com filtro específico
      try {
        // Primeiro lista os processos para identificar se existem
        const listResult = await execPromise(`tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV`);
        const hasChromeProcess = listResult.stdout.includes("chrome.exe");
        
        if (hasChromeProcess) {
          // Tenta encerrar processos pelo título da janela
          await execPromise(`taskkill /F /IM "chrome.exe" /FI "WINDOWTITLE eq *${sessionPattern}*"`);
          
          // Tenta encerrar processos pela linha de comando
          await execPromise(`taskkill /F /IM "chrome.exe" /FI "COMMANDLINE eq *${sessionPattern}*"`);
          
          // Verifica se ainda existem processos após a tentativa de encerramento
          const checkResult = await execPromise(`tasklist /FI "IMAGENAME eq chrome.exe" /FI "WINDOWTITLE eq *${sessionPattern}*" /FO CSV`);
          if (checkResult.stdout.includes("chrome.exe")) {
            logger.warn(`Alguns processos do Chrome para sessão ${whatsappId} podem ainda estar em execução`);
          } else {
            logger.info(`Processos chrome relacionados à sessão ${whatsappId} encerrados no Windows`);
          }
        } else {
          logger.info(`Nenhum processo chrome encontrado para sessão ${whatsappId} no Windows`);
        }
      } catch (error) {
        logger.info(`Nenhum processo chrome encontrado para sessão ${whatsappId} no Windows ou erro ao finalizar: ${error}`);
      }
    } else if (isLinux || isMac) {
      // No Linux/MacOS
      try {
        // Primeiro verifica se existem processos
        const checkCmd = isMac ? 
          `ps -ef | grep "${sessionPattern}" | grep -v grep` : 
          `ps aux | grep "${sessionPattern}" | grep -v grep`;
        
        try {
          const checkResult = await execPromise(checkCmd);
          const hasProcesses = checkResult.stdout.trim().length > 0;
          
          if (hasProcesses) {
            // Mata os processos usando pkill
            await execPromise(`pkill -f "${sessionPattern}"`);
            
            // Em seguida, força com SIGKILL se ainda existirem
            try {
              await execPromise(`pkill -9 -f "${sessionPattern}"`);
            } catch (killError) {
              // Ignorar erro aqui, pode significar que não há mais processos
            }
            
            // Verifica novamente se os processos foram encerrados
            try {
              const verifyResult = await execPromise(checkCmd);
              if (verifyResult.stdout.trim().length > 0) {
                logger.warn(`Alguns processos para ${sessionPattern} podem ainda estar em execução`);
              } else {
                logger.info(`Processos chrome relacionados à sessão ${whatsappId} encerrados com sucesso no Linux/MacOS`);
              }
            } catch (verifyError) {
              // Se der erro aqui, provavelmente significa que não há processos
              logger.info(`Processos chrome relacionados à sessão ${whatsappId} encerrados no Linux/MacOS`);
            }
          } else {
            logger.info(`Nenhum processo chrome encontrado para sessão ${whatsappId} no Linux/MacOS`);
          }
        } catch (checkError) {
          // Se der erro ao verificar, assume que não há processos
          logger.info(`Nenhum processo chrome encontrado para sessão ${whatsappId} no Linux/MacOS`);
        }
      } catch (error) {
        logger.error(`Erro ao matar processos para sessão ${whatsappId} no Linux/MacOS: ${error}`);
      }
    }
    
    // Pequena pausa para garantir que o SO processou os comandos de finalização
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    logger.error(`Erro ao matar processos para sessão ${whatsappId}: ${error}`);
  }
}

// Função específica e mais agressiva para limpar uma sessão antes de gerar QR code
export const forceCleanupBeforeQrCode = async (whatsappId: number | string): Promise<void> => {
  try {
    logger.info(`Iniciando limpeza completa e forçada antes de gerar QR code para sessão ${whatsappId}`);
    
    // 1. Atualiza status para DISCONNECTED para garantir que a sessão seja limpa
    await updateWhatsappStatus(Number(whatsappId), "DISCONNECTED", "", 0);
    
    // 2. Mata apenas os processos do Chrome relacionados a esta sessão específica
    await killSessionChromiumProcesses(whatsappId);
    
    // 3. Remove a sessão da memória
    await removeSessionFromMemory(whatsappId);
    
    // 4. Aguarda recursos serem liberados
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 5. Realiza limpeza forçada dos arquivos
    await cleanupSessionFiles(whatsappId, true);
    
    // 6. Aguarda para garantir que o sistema de arquivos foi liberado
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    logger.info(`Limpeza forçada da sessão ${whatsappId} antes de QR code concluída`);
  } catch (error) {
    logger.error(`Erro durante limpeza forçada para QR code na sessão ${whatsappId}: ${error}`);
    
    // Mesmo com erro, tenta limpar os arquivos
    try {
      await cleanupSessionFiles(whatsappId, true);
    } catch (cleanupError) {
      logger.error(`Erro adicional na limpeza de arquivos: ${cleanupError}`);
    }
  }
};

// Remove arquivos de bloqueio específicos que podem impedir a remoção da pasta
const removeLockFiles = async (sessionPath: string): Promise<void> => {
  try {
    // Remove o arquivo SingletonLock
    const lockFile = `${sessionPath}/SingletonLock`;
    if (await operationCache.fileExists(lockFile, 1000)) {
      try {
        fs.unlinkSync(lockFile);
        logger.info(`Arquivo de bloqueio removido: ${lockFile}`);
      } catch (err) {
        logger.error(`Erro ao remover arquivo de bloqueio ${lockFile}: ${err}`);
      }
    }
    
    // Limpa arquivos de bloqueio no diretório Default
    const defaultDir = path.join(sessionPath, "Default");
    if (await operationCache.fileExists(defaultDir, 1000)) {
      // Remove Lock do LevelDB
      const leveldbLock = path.join(defaultDir, "LOCK");
      if (await operationCache.fileExists(leveldbLock, 1000)) {
        try {
          fs.unlinkSync(leveldbLock);
          logger.info(`Arquivo LOCK do LevelDB removido: ${leveldbLock}`);
        } catch (lockErr) {
          logger.error(`Erro ao remover arquivo de bloqueio LevelDB: ${lockErr}`);
        }
      }
      
      // Arquivos de bloqueio adicionais que podem causar problemas
      const additionalLockFiles = [
        "Network/Cookies.lock",
        "Network/Cookies-journal",
        "Network/QuotaManager.lock",
        "Network/TransportSecurity.lock",
        "WebStorage/QuotaManager.lock",
        "WebStorage/QuotaManager-journal",
        "databases/Databases.db.lock",
        "databases/Databases.db-journal",
        "Extension State/LOCK",
        "Extension State/LOG.old",
        "BrowserMetrics/LOCK",
        "BrowserMetrics-journal",
        ".com.google.Chrome.xEShW1",
        "DevToolsActivePort"
      ];
      
      // Remove cada arquivo de bloqueio adicional
      for (const lockFilePath of additionalLockFiles) {
        const fullPath = path.join(defaultDir, lockFilePath);
        if (await operationCache.fileExists(fullPath, 1000)) {
          try {
            fs.unlinkSync(fullPath);
            logger.info(`Arquivo de bloqueio adicional removido: ${fullPath}`);
          } catch (additionalErr) {
            // Adiciona tentativa mais agressiva em caso de falha
            try {
              // No Windows, às vezes precisamos forçar
              if (process.platform === "win32") {
                const execPromise = promisify(exec);
                await execPromise(`del /F /Q "${fullPath}"`);
              } else {
                const execPromise = promisify(exec);
                await execPromise(`rm -f "${fullPath}"`);
              }
              logger.info(`Arquivo de bloqueio removido com método alternativo: ${fullPath}`);
            } catch (forceErr) {
              logger.error(`Erro ao remover arquivo de bloqueio adicional: ${additionalErr}`);
            }
          }
        }
      }
      
      // Remove outros arquivos de bloqueio comuns
      const cacheDirs = ["GPUCache", "IndexedDB", "Local Storage", "Service Worker", 
                         "Code Cache", "File System", "Sync Data", "Session Storage", 
                         "shared_proto_db", "VideoDecodeStats", "Platform Notifications"];
      for (const cacheDir of cacheDirs) {
        const cachePath = path.join(defaultDir, cacheDir);
        if (await operationCache.fileExists(cachePath, 1000)) {
          // Verifica arquivos LOCK padrão
          const cacheLock = path.join(cachePath, "LOCK");
          if (await operationCache.fileExists(cacheLock, 1000)) {
            try {
              fs.unlinkSync(cacheLock);
              logger.info(`Arquivo LOCK removido: ${cacheLock}`);
            } catch (cacheErr) {
              logger.error(`Erro ao remover arquivo de cache LOCK: ${cacheErr}`);
            }
          }
          
          // Verifica arquivos de log e journal
          const logFiles = ["LOG", "LOG.old", "MANIFEST-*", "*.ldb", "*.log", "*.sst", "*.journal"];
          for (const pattern of logFiles) {
            try {
              // Usando glob para encontrar arquivos que correspondem ao padrão
              const execPromise = promisify(exec);
              if (process.platform === "win32") {
                await execPromise(`del /F /Q "${cachePath}\\${pattern}" 2>nul`);
              } else {
                await execPromise(`rm -f "${cachePath}/${pattern}" 2>/dev/null`);
              }
            } catch (globErr) {
              // Silenciando erros aqui, pois alguns padrões podem não encontrar arquivos
            }
          }
        }
      }
    }
    
    // Limpa arquivos tmp/temp que podem estar bloqueados
    if (process.platform === "win32") {
      try {
        const execPromise = promisify(exec);
        await execPromise(`del /F /Q "${sessionPath}\\*tmp*" 2>nul`);
        await execPromise(`del /F /Q "${sessionPath}\\*temp*" 2>nul`);
        await execPromise(`del /F /Q "${sessionPath}\\*.lock" 2>nul`);
      } catch (tmpErr) {
        // Silenciando erros aqui
      }
    } else {
      try {
        const execPromise = promisify(exec);
        await execPromise(`find "${sessionPath}" -name "*tmp*" -type f -delete 2>/dev/null`);
        await execPromise(`find "${sessionPath}" -name "*temp*" -type f -delete 2>/dev/null`);
        await execPromise(`find "${sessionPath}" -name "*.lock" -type f -delete 2>/dev/null`);
      } catch (tmpErr) {
        // Silenciando erros aqui
      }
    }
    
    // Pequena pausa antes de retornar
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } catch (error) {
    logger.error(`Erro ao remover arquivos de bloqueio: ${error}`);
  }
};

// Abordagem alternativa para limpeza em caso de falha (útil para Windows)
const alternativeCleanup = async (sessionPath: string): Promise<void> => {
  try {
    const execPromise = promisify(exec);
    
    // No Windows, às vezes é necessário forçar a exclusão
    if (process.platform === "win32") {
      await execPromise(`rmdir /S /Q "${sessionPath}"`);
      logger.info(`Pasta removida com método alternativo: ${sessionPath}`);
    } else {
      // Para sistemas Unix/Linux
      await execPromise(`rm -rf "${sessionPath}"`);
      logger.info(`Pasta removida com método alternativo: ${sessionPath}`);
    }
  } catch (altError) {
    logger.error(`Método alternativo de limpeza também falhou: ${altError}`);
  }
};

// Atualiza o status de uma instância do WhatsApp no banco de dados
export const updateWhatsappStatus = async (
  whatsappId: number,
  status: string,
  qrcode: string = "",
  retries: number = 0
): Promise<void> => {
  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    
    if (!whatsapp) {
      logger.error(`WhatsApp ID ${whatsappId} não encontrado no banco de dados`);
      return;
    }
    
    await whatsapp.update({
      status,
      qrcode,
      retries
    });
    
    const io = getIO();
    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp,
      message: `Status atualizado para: ${status}`
    });
    
    logger.info(`Status do WhatsApp ID ${whatsappId} atualizado para ${status}`);
  } catch (error) {
    logger.error(`Erro ao atualizar status do WhatsApp ID ${whatsappId}: ${error}`);
  }
};

// Função para limpar todos os recursos ao iniciar o servidor
export const cleanupAllSessions = async (forceCleanup: boolean = false): Promise<void> => {
  try {
    logger.info("Iniciando limpeza de todas as sessões abandonadas");
    
    // Primeiro, mata processos do Chrome relacionados ao WhatsApp
    await killChromiumProcesses();
    
    const pathRoot = path.resolve(__dirname, "..", "..", "..", ".wwebjs_auth");
    
    // Verifica se o diretório existe
    if (!fs.existsSync(pathRoot)) {
      logger.info("Diretório .wwebjs_auth não encontrado. Ignorando limpeza global.");
      return;
    }
    
    // Lista todas as pastas de sessão
    const pastas = fs.readdirSync(pathRoot);
    
    for (const pasta of pastas) {
      if (pasta.startsWith("session-wbot-")) {
        // Extrai o ID da sessão do nome da pasta
        const sessionId = pasta.replace("session-wbot-", "");
        
        // Limpa esta sessão
        logger.info(`Limpando sessão abandonada: ${sessionId}`);
        await cleanupSessionFiles(sessionId, forceCleanup);
      }
    }
    
    logger.info("Limpeza global de sessões abandonadas concluída");
  } catch (error) {
    logger.error(`Erro durante limpeza global de sessões: ${error}`);
  }
};

// Adiciona uma função para limpar o cache periodicamente
export const startCacheCleanupInterval = (): NodeJS.Timeout => {
  // Limpa o cache a cada 5 minutos para evitar uso de memória excessivo
  return setInterval(() => {
    operationCache.cleanup();
    logger.debug("Limpeza periódica do cache de operações realizada");
  }, 300000); // 5 minutos
};

// Função de inicialização para ser chamada na inicialização do sistema
export const initSessionCleanupService = (): void => {
  // Limpa todas as sessões no início
  cleanupAllSessions(true).then(() => {
    logger.info("Limpeza inicial de sessões concluída");
  }).catch(error => {
    logger.error(`Erro durante limpeza inicial de sessões: ${error}`);
  });
  
  // Inicia o intervalo de limpeza de cache
  startCacheCleanupInterval();
  
  logger.info("Serviço de limpeza de sessões inicializado");
};
