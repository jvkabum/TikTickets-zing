/**
 * =============================================================================
 * OpenTelemetry Logger
 * TikTickets-zing - Substituição do Winston Logger
 * =============================================================================
 * 
 * Este logger utiliza a API de Logs do OpenTelemetry para enviar logs
 * via OTLP para o Collector. Mantém compatibilidade com a API do Winston.
 * 
 * Os logs são automaticamente correlacionados com traces através do
 * trace_id e span_id injetados pelo SDK.
 * 
 * =============================================================================
 */

import { context, trace } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import winston from 'winston';
import { getCurrentTenantId, getCurrentUserId, getCurrentWhatsAppId } from './propagation';

// =============================================================================
// Mapeamento de níveis
// =============================================================================

const levelToSeverity: Record<string, SeverityNumber> = {
    error: SeverityNumber.ERROR,
    warn: SeverityNumber.WARN,
    info: SeverityNumber.INFO,
    http: SeverityNumber.INFO,
    verbose: SeverityNumber.DEBUG,
    debug: SeverityNumber.DEBUG,
    silly: SeverityNumber.TRACE,
};

// =============================================================================
// OTel Logger Provider
// =============================================================================

const otelLogger = logs.getLogger('tiktickets-backend', '1.0.0');

// =============================================================================
// Função para emitir log via OTel
// =============================================================================

function emitOtelLog(
    level: string,
    message: string,
    attributes: Record<string, unknown> = {}
) {
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    // Tenta obter trace_id do span ativo ou dos atributos passados
    let traceId: string | undefined = spanContext?.traceId || (attributes.trace_id as string);
    let spanId: string | undefined = spanContext?.spanId || (attributes.span_id as string);

    // Se ainda não tiver traceId, tenta extrair do contexto atual do OTel
    if (!traceId) {
        const currentContext = trace.getSpanContext(context.active());
        traceId = currentContext?.traceId;
        spanId = currentContext?.spanId;
    }

    // Busca identificadores do contexto OTel (propagação automática)
    const contextTenantId = getCurrentTenantId();
    const contextUserId = getCurrentUserId();
    const contextWhatsAppId = getCurrentWhatsAppId();

    // Emite o log via OTel API
    otelLogger.emit({
        severityNumber: levelToSeverity[level] || SeverityNumber.INFO,
        severityText: level.toUpperCase(),
        body: message,
        attributes: {
            tenant_id: (attributes.tenant_id || contextTenantId) as any,
            user_id: (attributes.user_id || contextUserId) as any,
            whatsapp_id: (attributes.whatsapp_id || contextWhatsAppId) as any,
            ...attributes,
            // Correlação com trace
            trace_id: (traceId || '00000000000000000000000000000000') as any,
            span_id: (spanId || '0000000000000000') as any,
            'log.level': level as any,
        },
    });
}

// =============================================================================
// Winston Transport para OTel
// =============================================================================

import TransportStream from 'winston-transport';

class OTelTransport extends TransportStream {
    constructor(opts?: TransportStream.TransportStreamOptions) {
        super(opts);
    }

    log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        const { level, message, timestamp, stack, ...meta } = info;

        try {
            emitOtelLog(
                level || 'info',
                message || '',
                {
                    timestamp,
                    stack,
                    ...meta
                }
            );
        } catch (err) {
            // Silencioso para não derrubar o app
        }

        callback();
    }
}

// =============================================================================
// Winston Logger com OTel Transport
// =============================================================================

// Define o ambiente de execução
let env = 'prod';
if (process.env?.NODE_ENV) {
    env = process.env.NODE_ENV;
}

// Define o nível de log baseado no ambiente
const level = env === 'prod' ? 'info' : 'debug';

// Formato para console (mantém visual do Winston original)
const consoleFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        // Adiciona trace_id ao log do console se disponível
        const span = trace.getActiveSpan();
        const traceId = span?.spanContext()?.traceId;
        const traceIdStr = traceId ? ` [trace:${traceId.slice(-8)}]` : '';

        // Adiciona tenant_id se disponível nos metadados
        const tenantIdStr = meta.tenant_id ? ` [tenant:${meta.tenant_id}]` : '';

        if (stack) {
            return `${level}: ${timestamp}${traceIdStr}${tenantIdStr} ${message} - ${stack}`;
        }
        return `${level}: ${timestamp}${traceIdStr}${tenantIdStr} ${message}`;
    })
);

// Formato JSON para OTel transport
const jsonFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
);

// Cria o logger
const logger = winston.createLogger({
    level,
    transports: [
        // Console (visual original)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                consoleFormat
            ),
        }),
        // Arquivo de erros (mantido para backup local)
        new winston.transports.File({
            filename: './logs/app.logg',
            level: 'error',
            handleExceptions: true,
            maxsize: 10485760,
            maxFiles: 10,
            format: jsonFormat,
        }),
        // OTel Transport (envia para o Collector)
        new OTelTransport({
            level: 'debug', // Captura todos os níveis para OTel
        }),
    ],
});

// =============================================================================
// Helper para logs com contexto de tenant
// =============================================================================

interface LogContext {
    tenant_id?: string | number;
    user_id?: string | number;
    whatsapp_id?: string | number;
    ticket_id?: string | number;
    [key: string]: unknown;
}

/**
 * Cria um child logger com contexto de tenant
 */
function createTenantLogger(tenantId: string | number) {
    return logger.child({ tenant_id: tenantId });
}

/**
 * Log com contexto
 */
function logWithContext(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    ctx: LogContext = {}
) {
    const span = trace.getActiveSpan();
    const tenantId = ctx.tenant_id || getCurrentTenantId();

    // Adiciona contexto ao span ativo se existir
    if (span && tenantId) {
        span.setAttribute('tenant_id', String(tenantId));
    }

    logger.log(level, message, {
        tenant_id: tenantId,
        user_id: ctx.user_id || getCurrentUserId(),
        ...ctx
    });
}

// =============================================================================
// Exportações
// =============================================================================

export {
    createTenantLogger, emitOtelLog, logger, logWithContext
};

export default logger;
