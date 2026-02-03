/**
 * =============================================================================
 * OpenTelemetry Custom Metrics
 * TikTickets-zing - Business Metrics
 * =============================================================================
 * 
 * Métricas customizadas para monitorar aspectos específicos do TikTickets:
 * - Sessões do WhatsApp
 * - Tickets
 * - Conexões Socket.io
 * - Filas RabbitMQ
 * 
 * =============================================================================
 */

import { metrics, ValueType } from '@opentelemetry/api';

// =============================================================================
// Meter Instance
// =============================================================================

const meter = metrics.getMeter('tiktickets-backend', '1.0.0');

// =============================================================================
// WhatsApp Metrics
// =============================================================================

/**
 * Contador de sessões ativas do WhatsApp
 */
const whatsappSessionsActive = meter.createUpDownCounter('whatsapp_sessions_active', {
    description: 'Número de sessões WhatsApp ativas',
    unit: '{session}',
    valueType: ValueType.INT,
});

/**
 * Contador de mensagens enviadas
 */
const whatsappMessagesSent = meter.createCounter('whatsapp_messages_sent_total', {
    description: 'Total de mensagens enviadas via WhatsApp',
    unit: '{message}',
    valueType: ValueType.INT,
});

/**
 * Contador de mensagens recebidas
 */
const whatsappMessagesReceived = meter.createCounter('whatsapp_messages_received_total', {
    description: 'Total de mensagens recebidas via WhatsApp',
    unit: '{message}',
    valueType: ValueType.INT,
});

/**
 * Histograma de latência de envio de mensagem
 */
const whatsappMessageLatency = meter.createHistogram('whatsapp_message_send_duration_seconds', {
    description: 'Tempo para enviar mensagem via WhatsApp',
    unit: 's',
    valueType: ValueType.DOUBLE,
});

/**
 * Contador de erros de conexão
 */
const whatsappConnectionErrors = meter.createCounter('whatsapp_connection_errors_total', {
    description: 'Total de erros de conexão WhatsApp',
    unit: '{error}',
    valueType: ValueType.INT,
});

// =============================================================================
// Ticket Metrics
// =============================================================================

/**
 * Contador de tickets abertos
 */
const ticketsOpened = meter.createCounter('tickets_opened_total', {
    description: 'Total de tickets abertos',
    unit: '{ticket}',
    valueType: ValueType.INT,
});

/**
 * Contador de tickets fechados
 */
const ticketsClosed = meter.createCounter('tickets_closed_total', {
    description: 'Total de tickets fechados',
    unit: '{ticket}',
    valueType: ValueType.INT,
});

/**
 * Gauge de tickets em atendimento
 */
const ticketsInProgress = meter.createUpDownCounter('tickets_in_progress', {
    description: 'Tickets atualmente em atendimento',
    unit: '{ticket}',
    valueType: ValueType.INT,
});

/**
 * Histograma de tempo de atendimento
 */
const ticketResolutionTime = meter.createHistogram('ticket_resolution_time_seconds', {
    description: 'Tempo para resolver um ticket',
    unit: 's',
    valueType: ValueType.DOUBLE,
});

/**
 * Histograma de tempo de primeira resposta
 */
const ticketFirstResponseTime = meter.createHistogram('ticket_first_response_time_seconds', {
    description: 'Tempo até primeira resposta do atendente',
    unit: 's',
    valueType: ValueType.DOUBLE,
});

// =============================================================================
// Socket.io Metrics
// =============================================================================

/**
 * Gauge de conexões ativas
 */
const socketConnectionsActive = meter.createUpDownCounter('socket_connections_active', {
    description: 'Conexões Socket.io ativas',
    unit: '{connection}',
    valueType: ValueType.INT,
});

/**
 * Contador de eventos emitidos
 */
const socketEventsEmitted = meter.createCounter('socket_events_emitted_total', {
    description: 'Total de eventos Socket.io emitidos',
    unit: '{event}',
    valueType: ValueType.INT,
});

/**
 * Contador de eventos recebidos
 */
const socketEventsReceived = meter.createCounter('socket_events_received_total', {
    description: 'Total de eventos Socket.io recebidos',
    unit: '{event}',
    valueType: ValueType.INT,
});

// =============================================================================
// Queue Metrics (RabbitMQ)
// =============================================================================

/**
 * Gauge de mensagens na fila
 */
const queueDepth = meter.createUpDownCounter('queue_depth', {
    description: 'Número de mensagens na fila',
    unit: '{message}',
    valueType: ValueType.INT,
});

/**
 * Contador de mensagens publicadas
 */
const queueMessagesPublished = meter.createCounter('queue_messages_published_total', {
    description: 'Total de mensagens publicadas nas filas',
    unit: '{message}',
    valueType: ValueType.INT,
});

/**
 * Contador de mensagens consumidas
 */
const queueMessagesConsumed = meter.createCounter('queue_messages_consumed_total', {
    description: 'Total de mensagens consumidas das filas',
    unit: '{message}',
    valueType: ValueType.INT,
});

/**
 * Histograma de tempo de processamento
 */
const queueProcessingDuration = meter.createHistogram('queue_processing_duration_seconds', {
    description: 'Tempo para processar mensagem da fila',
    unit: 's',
    valueType: ValueType.DOUBLE,
});

// =============================================================================
// Database Metrics (complementar ao auto-instrumentation)
// =============================================================================

/**
 * Gauge de conexões ativas no pool
 */
const dbPoolActive = meter.createUpDownCounter('db_pool_connections_active', {
    description: 'Conexões ativas no pool do banco de dados',
    unit: '{connection}',
    valueType: ValueType.INT,
});

/**
 * Gauge de conexões idle no pool
 */
const dbPoolIdle = meter.createUpDownCounter('db_pool_connections_idle', {
    description: 'Conexões idle no pool do banco de dados',
    unit: '{connection}',
    valueType: ValueType.INT,
});

// =============================================================================
// Tenant Metrics
// =============================================================================

/**
 * Gauge de tenants ativos
 */
const tenantsActive = meter.createUpDownCounter('tenants_active', {
    description: 'Número de tenants ativos',
    unit: '{tenant}',
    valueType: ValueType.INT,
});

// =============================================================================
// Helper Functions
// =============================================================================

interface MetricLabels {
    tenant_id?: string;
    whatsapp_id?: string;
    queue?: string;
    status?: string;
    event?: string;
    [key: string]: string | undefined;
}

/**
 * Registra envio de mensagem WhatsApp
 */
function recordWhatsAppMessageSent(tenantId: string, whatsappId: string) {
    whatsappMessagesSent.add(1, {
        tenant_id: tenantId,
        whatsapp_id: whatsappId,
    });
}

/**
 * Registra recebimento de mensagem WhatsApp
 */
function recordWhatsAppMessageReceived(tenantId: string, whatsappId: string) {
    whatsappMessagesReceived.add(1, {
        tenant_id: tenantId,
        whatsapp_id: whatsappId,
    });
}

/**
 * Registra latência de envio de mensagem
 */
function recordWhatsAppLatency(durationSeconds: number, tenantId: string) {
    whatsappMessageLatency.record(durationSeconds, {
        tenant_id: tenantId,
    });
}

/**
 * Registra sessão WhatsApp conectada
 */
function recordWhatsAppSessionConnected(tenantId: string, whatsappId: string) {
    whatsappSessionsActive.add(1, {
        tenant_id: tenantId,
        whatsapp_id: whatsappId,
    });
}

/**
 * Registra sessão WhatsApp desconectada
 */
function recordWhatsAppSessionDisconnected(tenantId: string, whatsappId: string) {
    whatsappSessionsActive.add(-1, {
        tenant_id: tenantId,
        whatsapp_id: whatsappId,
    });
}

/**
 * Registra erro de conexão WhatsApp
 */
function recordWhatsAppConnectionError(tenantId: string, whatsappId: string, errorType: string) {
    whatsappConnectionErrors.add(1, {
        tenant_id: tenantId,
        whatsapp_id: whatsappId,
        error_type: errorType,
    });
}

/**
 * Registra o status de uma sessão WhatsApp (Geral)
 */
function recordWhatsAppSessionStatus(whatsappId: string, status: 'connected' | 'disconnected' | 'failed_verification' | 'opening') {
    whatsappConnectionErrors.add(1, {
        whatsapp_id: whatsappId,
        status: status,
    });
}

/**
 * Registra abertura de ticket
 */
function recordTicketOpened(tenantId: string, queueId?: string) {
    ticketsOpened.add(1, {
        tenant_id: tenantId,
        queue_id: queueId,
    });
    ticketsInProgress.add(1, {
        tenant_id: tenantId,
    });
}

/**
 * Registra fechamento de ticket
 */
function recordTicketClosed(tenantId: string, resolutionTimeSeconds: number) {
    ticketsClosed.add(1, {
        tenant_id: tenantId,
    });
    ticketsInProgress.add(-1, {
        tenant_id: tenantId,
    });
    ticketResolutionTime.record(resolutionTimeSeconds, {
        tenant_id: tenantId,
    });
}

/**
 * Registra primeira resposta do ticket
 */
function recordTicketFirstResponse(tenantId: string, firstResponseTimeSeconds: number) {
    ticketFirstResponseTime.record(firstResponseTimeSeconds, {
        tenant_id: tenantId,
    });
}

/**
 * Registra conexão Socket.io
 */
function recordSocketConnection(tenantId: string) {
    socketConnectionsActive.add(1, {
        tenant_id: tenantId,
    });
}

/**
 * Registra desconexão Socket.io
 */
function recordSocketDisconnection(tenantId: string) {
    socketConnectionsActive.add(-1, {
        tenant_id: tenantId,
    });
}

/**
 * Registra evento Socket.io emitido
 */
function recordSocketEventEmitted(event: string, tenantId: string) {
    socketEventsEmitted.add(1, {
        event,
        tenant_id: tenantId,
    });
}

// =============================================================================
// Exportações
// =============================================================================

export {
    // Database
    dbPoolActive,
    dbPoolIdle, meter,
    // Queue
    queueDepth, queueMessagesConsumed, queueMessagesPublished, queueProcessingDuration, recordSocketConnection,
    recordSocketDisconnection,
    recordSocketEventEmitted, recordTicketClosed,
    recordTicketFirstResponse, recordTicketOpened, recordWhatsAppConnectionError, recordWhatsAppLatency, recordWhatsAppMessageReceived, recordWhatsAppMessageSent, recordWhatsAppSessionConnected,
    recordWhatsAppSessionDisconnected,
    recordWhatsAppSessionStatus,
    // Socket.io
    socketConnectionsActive,
    socketEventsEmitted,
    socketEventsReceived,
    // Tenant
    tenantsActive, ticketFirstResponseTime, ticketResolutionTime, ticketsClosed,
    ticketsInProgress,
    // Tickets
    ticketsOpened, whatsappConnectionErrors, whatsappMessageLatency, whatsappMessagesReceived, whatsappMessagesSent,
    // WhatsApp
    whatsappSessionsActive
};

