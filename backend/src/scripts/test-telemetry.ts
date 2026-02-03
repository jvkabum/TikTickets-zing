/**
 * =============================================================================
 * Telemetry Validation Script
 * TikTickets-zing - Test Signals
 * =============================================================================
 * 
 * Este script emite traces, logs e métricas para validar se o OTel Collector
 * está recebendo os dados corretamente.
 * 
 * Uso:
 *   npx ts-node -r ./src/telemetry/index.ts src/scripts/test-telemetry.ts
 * 
 * =============================================================================
 */

import { logger } from '../telemetry/logger';
import { recordTicketOpened, recordWhatsAppMessageSent } from '../telemetry/metrics';
import { addSpanEvent, withSpan } from '../telemetry/tracer';

async function validateTelemetry() {
    console.log('🚀 Iniciando validação de telemetria...');

    const tenantId = 'test-tenant-999';
    const whatsappId = 'test-wa-123';

    // 1. Validar Tracing e Logs correlacionados
    await withSpan('validation-manual-test', async (span) => {
        span.setAttribute('test_type', 'manual_validation');

        logger.info('Emitindo log de teste dentro de um span', {
            tenant_id: tenantId,
            test_step: 'step-1'
        });

        addSpanEvent('Evento de Teste', { detail: 'Tudo funcionando!' });

        // Simulando uma pequena demora
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Validar Métricas Customizadas
        console.log('📊 Registrando métricas...');
        recordWhatsAppMessageSent(tenantId, whatsappId);
        recordTicketOpened(tenantId, 'financeiro');

        logger.warn('Aviso de teste: métricas emitidas', { tenant_id: tenantId });
    }, { tenant_id: tenantId });

    // 3. Validar Log de Erro (para ver se chega no Loki)
    try {
        throw new Error('Erro simulado para validação');
    } catch (err) {
        logger.error('Validando erro no Loki/OTel', {
            tenant_id: tenantId,
            error: (err as Error).message,
            stack: (err as Error).stack
        });
    }

    console.log('✅ Sinais básicos emitidos. Aguardando processamento do exportador (15s)...');

    // O SDK exporta métricas a cada 15s conforme configuramos
    await new Promise(resolve => setTimeout(resolve, 16000));

    console.log('🏁 Validação concluída. Verifique no Jaeger, Loki e Prometheus.');
    process.exit(0);
}

validateTelemetry().catch(err => {
    console.error('❌ Falha na validação:', err);
    process.exit(1);
});
