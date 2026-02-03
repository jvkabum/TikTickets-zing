/**
 * =============================================================================
 * OpenTelemetry Web SDK Bootstrap
 * TikTickets-zing - Frontend Vue 3 (Vite/Quasar 2)
 * =============================================================================
 */

import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
    SEMRESATTRS_SERVICE_NAME,
    SEMRESATTRS_SERVICE_NAMESPACE
} from '@opentelemetry/semantic-conventions';

// =============================================================================
// Configuração
// =============================================================================

const OTEL_ENABLED = process.env.VITE_OTEL_ENABLED !== 'false';
const OTLP_ENDPOINT = process.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT ||
    (process.env.NODE_ENV === 'production'
        ? 'https://backend.autotick.com.br/otel/v1/traces'
        : 'http://localhost:4318/v1/traces');
const SERVICE_NAME = 'tiktickets-frontend-vue3';
const DEPLOYMENT_ENV = process.env.NODE_ENV || 'development';

let tracerProvider = null;

if (OTEL_ENABLED) {
    tracerProvider = new WebTracerProvider({
        resource: new Resource({
            [SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
            [SEMRESATTRS_SERVICE_NAMESPACE]: 'tiktickets',
            [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: DEPLOYMENT_ENV,
        }),
    });

    // Exporter - Envia traces para o Collector (OTLP/HTTP)
    const exporter = new OTLPTraceExporter({
        url: OTLP_ENDPOINT,
    });

    // Span Processor - Envio em lote
    tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        scheduledDelayMillis: 5000,
    }));

    // Context Manager - Necessário para rastreio assíncrono no browser
    tracerProvider.register({
        contextManager: new ZoneContextManager(),
    });

    // Instrumentações Automáticas
    registerInstrumentations({
        instrumentations: [
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [
                    /localhost:3100/, // Backend dev
                    /autotick.com.br/, // Backend prod
                ],
            }),
            new XMLHttpRequestInstrumentation({
                propagateTraceHeaderCorsUrls: [
                    /localhost:3100/,
                    /autotick.com.br/,
                ],
            }),
        ],
    });

    console.log(`[OTel] Frontend Telemetry inicializada: ${SERVICE_NAME}`);
    console.log(`[OTel] Endpoint: ${OTLP_ENDPOINT}`);
}

export const tracer = tracerProvider ? tracerProvider.getTracer(SERVICE_NAME) : null;

// Log de verificação (fora do bloco de inicialização para evitar TDZ)
if (tracer) {
    const span = tracer.startSpan('frontend-init');
    console.log(`[OTel] Trace ID atual: ${span.spanContext().traceId}`);
    span.end();
}

export default tracerProvider;
