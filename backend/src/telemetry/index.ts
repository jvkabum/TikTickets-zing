/**
 * =============================================================================
 * OpenTelemetry SDK Bootstrap
 * TikTickets-zing - Telemetry Entry Point
 * =============================================================================
 * 
 * IMPORTANTE: Este arquivo DEVE ser importado ANTES de qualquer outro código.
 * A instrumentação automática requer que o SDK seja inicializado antes de
 * qualquer módulo ser carregado.
 * 
 * Uso no server.ts:
 *   import './telemetry';  // PRIMEIRA LINHA
 *   import __init from './app';
 *   // ... resto do código
 * 
 * =============================================================================
 */

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
    SEMRESATTRS_SERVICE_NAME,
    SEMRESATTRS_SERVICE_NAMESPACE,
    SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

// =============================================================================
// Configuração
// =============================================================================

const OTEL_ENABLED = process.env.OTEL_SDK_DISABLED !== 'true';

// ⚠️ IMPORTANTE: Em Docker, usar nome do container (otel-collector:4317), não localhost
const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'tiktickets-backend';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';
const DEPLOYMENT_ENV = process.env.NODE_ENV || 'development';

// Habilita logging de diagnóstico em desenvolvimento
if (DEPLOYMENT_ENV !== 'production') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

// =============================================================================
// Resource - Identificação do Serviço
// =============================================================================

const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
    [SEMRESATTRS_SERVICE_VERSION]: SERVICE_VERSION,
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'tiktickets',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: DEPLOYMENT_ENV,
});

// =============================================================================
// Exporters - Enviam dados para o OTel Collector
// =============================================================================

const traceExporter = new OTLPTraceExporter({
    url: `${OTEL_ENDPOINT}`,
});

const metricExporter = new OTLPMetricExporter({
    url: `${OTEL_ENDPOINT}`,
});

const logExporter = new OTLPLogExporter({
    url: `${OTEL_ENDPOINT}`,
});

// =============================================================================
// SDK Initialization
// =============================================================================

let sdk: NodeSDK | null = null;

if (OTEL_ENABLED) {
    sdk = new NodeSDK({
        resource,
        traceExporter,
        metricReader: new PeriodicExportingMetricReader({
            exporter: metricExporter,
            exportIntervalMillis: 15000,
        }) as any,
        logRecordProcessor: new BatchLogRecordProcessor(logExporter),
        instrumentations: [
            getNodeAutoInstrumentations({
                // Configurações específicas de instrumentação
                '@opentelemetry/instrumentation-http': {
                    ignoreIncomingRequestHook: (request) => {
                        // Ignora health checks para reduzir ruído e cardinalidade
                        const url = request.url || '';
                        return url.includes('/health') || url.includes('/ready');
                    },
                    requestHook: (span, request) => {
                        // TODO(otel): Migrar para propagação via Context API para
                        // funcionar também em Socket.io, jobs e RabbitMQ consumers.
                        // Por ora, depende do middleware isAuth ter setado tenantId.
                        const tenantId = (request as any).tenantId;
                        if (tenantId) {
                            span.setAttribute('tenant_id', String(tenantId));
                        }
                    },
                },
                '@opentelemetry/instrumentation-express': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-pg': {
                    enabled: true,
                    enhancedDatabaseReporting: true,
                },
                '@opentelemetry/instrumentation-redis': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-socket.io': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-amqplib': {
                    enabled: true, // RabbitMQ
                },
                '@opentelemetry/instrumentation-winston': {
                    // TODO(otel): Remover quando logger OTel estiver 100% implementado
                    // e Winston for deprecado. Por ora, mantém correlação temporária.
                    enabled: true,
                },
                '@opentelemetry/instrumentation-fs': {
                    enabled: false, // Desabilita para evitar excesso de spans
                },
                '@opentelemetry/instrumentation-dns': {
                    enabled: false,
                },
            }),
        ],
    });

    // Inicia o SDK
    sdk.start();
    console.log('[OTel] OpenTelemetry SDK iniciado com sucesso');
    console.log(`[OTel] Endpoint: ${OTEL_ENDPOINT}`);
    console.log(`[OTel] Service: ${SERVICE_NAME}@${SERVICE_VERSION}`);
} else {
    console.log('[OTel] OpenTelemetry SDK desabilitado (OTEL_SDK_DISABLED=true)');
}

// =============================================================================
// Graceful Shutdown
// =============================================================================

const shutdown = async () => {
    if (sdk) {
        try {
            await sdk.shutdown();
            console.log('[OTel] SDK encerrado com sucesso');
        } catch (error) {
            console.error('[OTel] Erro ao encerrar SDK:', error);
        }
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// =============================================================================
// Exportações
// =============================================================================

export { sdk };
export default sdk;
