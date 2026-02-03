import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Inicialização imediata do Sentry v10+.
// Este arquivo deve ser importado como a PRIMEIRA LINHA no server.ts.
const SENTRY_DSN = process.env.SENTRY_DSN || "https://362610dc5ab76bba5e2c3db07dfda11e@o4510819566485504.ingest.us.sentry.io/4510822953058304";

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Tracing / Performance
        tracesSampleRate: 1.0,
        // Profiling
        profilesSampleRate: 1.0,
        // Segurança e Privacidade
        sendDefaultPii: true,
        environment: process.env.NODE_ENV || "development",
    });
    console.log("[Sentry] Inicializado antecipadamente via instrument.ts");

    // Exemplo de métricas solicitadas
    Sentry.metrics.count('backend_init_count', 1);
    Sentry.metrics.gauge('backend_memory_usage', process.memoryUsage().heapUsed / 1024 / 1024);
} else {
    console.warn("[Sentry] DSN não encontrado no instrument.ts");
}
