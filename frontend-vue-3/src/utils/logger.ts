/**
 * =============================================================================
 * TikTickets Frontend Logger
 * =============================================================================
 * Este utilitário fornece uma interface limpa para logging no frontend,
 * integrando automaticamente com o Sentry para monitoramento.
 */

import * as Sentry from "@sentry/vue";
import { tracer } from "../telemetry";

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    fingerprint?: string[];
}

/**
 * Envia o log para o Console e para o Sentry
 */
const log = (level: LogLevel, message: string, options: LogOptions = {}) => {
    const { tags = {}, extra = {}, fingerprint } = options;

    // Adiciona trace context se disponível
    if (tracer) {
        // O Sentry captura automaticamente o trace_id do OTel se estiverem integrados,
        // mas podemos reforçar aqui se necessário.
    }

    // 1. Log no Console (apenas em desenvolvimento ou se explicitamente desejado)
    if (process.env.NODE_ENV !== 'production' || level === 'error') {
        const consoleMethod = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, { tags, extra });
    }

    // 2. Envio para o Sentry (Breadcrumb ou Evento dependendo do nível)
    if (level === 'error' || level === 'warn') {
        Sentry.captureMessage(message, {
            level: level === 'warn' ? 'warning' : 'error',
            tags: { log_source: 'frontend_logger', ...tags },
            extra,
            fingerprint,
        });
    } else {
        // Info/Debug viram breadcrumbs para economizar cota no Sentry, 
        // mas estarão presentes quando um erro ocorrer.
        Sentry.addBreadcrumb({
            category: 'ui.log',
            message: message,
            level: level === 'info' ? 'info' : 'debug',
            data: { ...tags, ...extra },
        });
    }
};

export const logger = {
    info: (msg: string, opts?: LogOptions) => log('info', msg, opts),
    warn: (msg: string, opts?: LogOptions) => log('warn', msg, opts),
    error: (msg: string, opts?: LogOptions) => log('error', msg, opts),
    debug: (msg: string, opts?: LogOptions) => log('debug', msg, opts),
};

export default logger;
