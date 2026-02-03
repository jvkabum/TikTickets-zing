/**
 * =============================================================================
 * TikTickets Logger - OpenTelemetry Enabled
 * =============================================================================
 * Este arquivo substitui o logger original, adicionando suporte automático
 * para exportação de logs via OTLP para o Loki/Grafana.
 */

import { createTenantLogger, logger, logWithContext } from '../telemetry/logger';

// Exporta o logger principal para manter compatibilidade com o resto do código
export { createTenantLogger, logger, logWithContext };
export default logger;
