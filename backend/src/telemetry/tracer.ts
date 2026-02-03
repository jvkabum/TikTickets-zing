/**
 * =============================================================================
 * OpenTelemetry Tracer Utilities
 * TikTickets-zing - Custom Span Creation
 * =============================================================================
 * 
 * Utilitários para criar spans customizados para operações específicas
 * do TikTickets como fluxos de WhatsApp, processamento de tickets, etc.
 * 
 * =============================================================================
 */

import { context, Context, Span, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

// =============================================================================
// Tracer Instance
// =============================================================================

const tracer = trace.getTracer('tiktickets-backend', '1.0.0');

// =============================================================================
// Types
// =============================================================================

interface SpanAttributes {
    tenant_id?: string | number;
    user_id?: string | number;
    whatsapp_id?: string | number;
    ticket_id?: string | number;
    [key: string]: string | number | boolean | undefined;
}

type AsyncFunction<T> = () => Promise<T>;

// =============================================================================
// Span Creation Helpers
// =============================================================================

/**
 * Executa uma função dentro de um span customizado
 * 
 * @example
 * const result = await withSpan('process-message', async (span) => {
 *   span.setAttribute('message_type', 'text');
 *   return await processMessage(message);
 * }, { tenant_id: tenantId });
 */
async function withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes: SpanAttributes = {},
    kind: SpanKind = SpanKind.INTERNAL
): Promise<T> {
    return tracer.startActiveSpan(name, { kind }, async (span) => {
        try {
            // Adiciona atributos
            Object.entries(attributes).forEach(([key, value]) => {
                if (value !== undefined) {
                    span.setAttribute(key, value);
                }
            });

            const result = await fn(span);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        } catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error instanceof Error ? error.message : 'Unknown error',
            });
            span.recordException(error as Error);
            throw error;
        } finally {
            span.end();
        }
    });
}

/**
 * Versão síncrona do withSpan
 */
function withSpanSync<T>(
    name: string,
    fn: (span: Span) => T,
    attributes: SpanAttributes = {},
    kind: SpanKind = SpanKind.INTERNAL
): T {
    const span = tracer.startSpan(name, { kind });

    try {
        // Adiciona atributos
        Object.entries(attributes).forEach(([key, value]) => {
            if (value !== undefined) {
                span.setAttribute(key, value);
            }
        });

        const result = fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
    } catch (error) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
    } finally {
        span.end();
    }
}

// =============================================================================
// Domain-Specific Spans
// =============================================================================

/**
 * Span para operações de WhatsApp
 */
async function withWhatsAppSpan<T>(
    operation: string,
    fn: (span: Span) => Promise<T>,
    attrs: { whatsapp_id: string | number; tenant_id: string | number;[key: string]: unknown }
): Promise<T> {
    return withSpan(
        `whatsapp.${operation}`,
        fn,
        {
            'whatsapp.operation': operation,
            ...attrs,
        },
        SpanKind.CLIENT
    );
}

/**
 * Span para operações de Ticket
 */
async function withTicketSpan<T>(
    operation: string,
    fn: (span: Span) => Promise<T>,
    attrs: { ticket_id: string | number; tenant_id: string | number;[key: string]: unknown }
): Promise<T> {
    return withSpan(
        `ticket.${operation}`,
        fn,
        {
            'ticket.operation': operation,
            ...attrs,
        },
        SpanKind.INTERNAL
    );
}

/**
 * Span para operações de Socket.io
 */
async function withSocketSpan<T>(
    event: string,
    fn: (span: Span) => Promise<T>,
    attrs: { tenant_id: string | number; user_id?: string | number;[key: string]: unknown }
): Promise<T> {
    return withSpan(
        `socket.${event}`,
        fn,
        {
            'socket.event': event,
            ...attrs,
        },
        SpanKind.SERVER
    );
}

/**
 * Span para operações de Queue (RabbitMQ)
 */
async function withQueueSpan<T>(
    queue: string,
    operation: 'publish' | 'consume',
    fn: (span: Span) => Promise<T>,
    attrs: { tenant_id?: string | number;[key: string]: unknown }
): Promise<T> {
    return withSpan(
        `queue.${operation}`,
        fn,
        {
            'messaging.system': 'rabbitmq',
            'messaging.destination': queue,
            'messaging.operation': operation,
            ...attrs,
        },
        operation === 'publish' ? SpanKind.PRODUCER : SpanKind.CONSUMER
    );
}

// =============================================================================
// Context Propagation
// =============================================================================

/**
 * Obtém o trace_id atual (útil para logs)
 */
function getCurrentTraceId(): string | undefined {
    const span = trace.getActiveSpan();
    return span?.spanContext()?.traceId;
}

/**
 * Obtém o span_id atual
 */
function getCurrentSpanId(): string | undefined {
    const span = trace.getActiveSpan();
    return span?.spanContext()?.spanId;
}

/**
 * Obtém o contexto atual para propagação
 */
function getCurrentContext(): Context {
    return context.active();
}

/**
 * Executa código com um contexto específico
 */
function runWithContext<T>(ctx: Context, fn: () => T): T {
    return context.with(ctx, fn);
}

// =============================================================================
// Metrics Helpers (para uso com custom metrics)
// =============================================================================

/**
 * Adiciona evento ao span atual
 */
function addSpanEvent(name: string, attributes?: SpanAttributes): void {
    const span = trace.getActiveSpan();
    if (span) {
        span.addEvent(name, attributes as Record<string, string | number | boolean>);
    }
}

/**
 * Adiciona atributo ao span atual
 */
function setSpanAttribute(key: string, value: string | number | boolean): void {
    const span = trace.getActiveSpan();
    if (span) {
        span.setAttribute(key, value);
    }
}

/**
 * Registra erro em um span de WhatsApp
 */
function recordWhatsAppError(whatsappId: string | number, errorCode: string) {
    const span = trace.getActiveSpan();
    if (span) {
        span.setAttribute('error.code', errorCode);
        span.setStatus({ code: SpanStatusCode.ERROR, message: `WhatsApp Error: ${errorCode}` });
    }
}

// =============================================================================
// Exportações
// =============================================================================

export {
    addSpanEvent, getCurrentContext, getCurrentSpanId, getCurrentTraceId, recordWhatsAppError, runWithContext, setSpanAttribute,
    SpanKind,
    SpanStatusCode, tracer, withQueueSpan, withSocketSpan, withSpan,
    withSpanSync, withTicketSpan, withWhatsAppSpan
};

export type { Span, SpanAttributes };

