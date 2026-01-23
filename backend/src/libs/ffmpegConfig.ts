/**
 * Módulo centralizado de configuração do FFmpeg
 * 
 * Este módulo DEVE ser importado ANTES de qualquer uso do fluent-ffmpeg
 * para garantir que o path do binário seja configurado corretamente.
 * 
 * @example
 * import ffmpeg from "../libs/ffmpegConfig";
 * ffmpeg(inputFile).toFormat("mp3")...
 */

import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { logger } from "../utils/logger";

// Configura o path do FFmpeg para usar o binário estático do npm
// Isso garante compatibilidade entre Windows, Linux e macOS
if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    logger.info(`[FFmpeg] Configurado com binário estático: ${ffmpegStatic}`);
} else {
    logger.warn("[FFmpeg] Binário estático não encontrado. Tentando usar FFmpeg do sistema.");
}

export default ffmpeg;
