/**
 * =============================================================================
 * OpenTelemetry Context Propagation
 * TikTickets-zing - Tenant Context Management
 * =============================================================================
 * 
 * Utilitários para propagação de contexto de tenant através do OTel Context API.
 * Isso garante que o tenant_id seja propagado automaticamente para:
 * - Spans filhos
 * - Logs correlacionados
 * - Jobs assíncronos
 * - Consumers de filas RabbitMQ
 * - Eventos Socket.io
 * 
 * Uso:
 *   // No middleware de autenticação
 *   const ctx = setTenantContext(tenantId);
 *   return context.with(ctx, () => next());
 * 
 *   // Em qualquer lugar do código
 *   const tenantId = getCurrentTenantId();
 * 
 * =============================================================================
 */

import { context, Context, createContextKey, trace } from '@opentelemetry/api';

// =============================================================================
// Context Keys
// =============================================================================

const TENANT_ID_KEY = createContextKey('tiktickets.tenant_id');
const USER_ID_KEY = createContextKey('tiktickets.user_id');
const WHATSAPP_ID_KEY = createContextKey('tiktickets.whatsapp_id');

// =============================================================================
// Context Setters
// =============================================================================

/**
 * Cria um novo contexto com tenant_id
 * 
 * @example
 * const ctx = setTenantContext('tenant-123');
 * context.with(ctx, async () => {
 *   // Todo código aqui terá acesso ao tenant_id
 *   await processRequest();
 * });
 */
function setTenantContext(tenantId: string | number, baseContext?: Context): Context {
    const ctx = baseContext ?? context.active();
    return ctx.setValue(TENANT_ID_KEY, String(tenantId));
}

/**
 * Cria um novo contexto com user_id
 */
function setUserContext(userId: string | number, baseContext?: Context): Context {
    const ctx = baseContext ?? context.active();
    return ctx.setValue(USER_ID_KEY, String(userId));
}

/**
 * Cria um novo contexto com whatsapp_id
 */
function setWhatsAppContext(whatsappId: string | number, baseContext?: Context): Context {
    const ctx = baseContext ?? context.active();
    return ctx.setValue(WHATSAPP_ID_KEY, String(whatsappId));
}

/**
 * Cria um contexto completo com todos os identificadores
 */
function setFullContext(
    ids: {
        tenantId?: string | number;
        userId?: string | number;
        whatsappId?: string | number;
    },
    baseContext?: Context
): Context {
    let ctx = baseContext ?? context.active();

    if (ids.tenantId) {
        ctx = ctx.setValue(TENANT_ID_KEY, String(ids.tenantId));
    }
    if (ids.userId) {
        ctx = ctx.setValue(USER_ID_KEY, String(ids.userId));
    }
    if (ids.whatsappId) {
        ctx = ctx.setValue(WHATSAPP_ID_KEY, String(ids.whatsappId));
    }

    return ctx;
}

// =============================================================================
// Context Getters
// =============================================================================

/**
 * Obtém o tenant_id do contexto atual
 */
function getCurrentTenantId(): string | undefined {
    return context.active().getValue(TENANT_ID_KEY) as string | undefined;
}

/**
 * Obtém o user_id do contexto atual
 */
function getCurrentUserId(): string | undefined {
    return context.active().getValue(USER_ID_KEY) as string | undefined;
}

/**
 * Obtém o whatsapp_id do contexto atual
 */
function getCurrentWhatsAppId(): string | undefined {
    return context.active().getValue(WHATSAPP_ID_KEY) as string | undefined;
}

/**
 * Obtém todos os identificadores do contexto atual
 */
function getCurrentContextIds(): {
    tenantId?: string;
    userId?: string;
    whatsappId?: string;
} {
    return {
        tenantId: getCurrentTenantId(),
        userId: getCurrentUserId(),
        whatsappId: getCurrentWhatsAppId(),
    };
}

// =============================================================================
// Context Runners
// =============================================================================

/**
 * Executa uma função com contexto de tenant
 * 
 * @example
 * await runWithTenant(tenantId, async () => {
 *   // Logs, spans e métricas aqui terão tenant_id
 *   await processTicket(ticketId);
 * });
 */
function runWithTenant<T>(tenantId: string | number, fn: () => T): T {
    const ctx = setTenantContext(tenantId);
    return context.with(ctx, fn);
}

/**
 * Executa uma função com contexto completo
 */
function runWithContext<T>(
    ids: {
        tenantId?: string | number;
        userId?: string | number;
        whatsappId?: string | number;
    },
    fn: () => T
): T {
    const ctx = setFullContext(ids);
    return context.with(ctx, fn);
}

// =============================================================================
// Span Enrichment
// =============================================================================

/**
 * Adiciona os identificadores do contexto ao span ativo
 * Útil quando você quer garantir que o span tem os atributos corretos
 */
function enrichActiveSpanWithContext(): void {
    const span = trace.getActiveSpan();
    if (!span) return;

    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    const whatsappId = getCurrentWhatsAppId();

    if (tenantId) {
        span.setAttribute('tenant_id', tenantId);
    }
    if (userId) {
        span.setAttribute('user_id', userId);
    }
    if (whatsappId) {
        span.setAttribute('whatsapp_id', whatsappId);
    }
}

/**
 * Cria um objeto de atributos a partir do contexto atual
 * Útil para adicionar a logs e métricas
 */
function getContextAttributes(): Record<string, string> {
    const attrs: Record<string, string> = {};

    const tenantId = getCurrentTenantId();
    const userId = getCurrentUserId();
    const whatsappId = getCurrentWhatsAppId();

    if (tenantId) attrs.tenant_id = tenantId;
    if (userId) attrs.user_id = userId;
    if (whatsappId) attrs.whatsapp_id = whatsappId;

    return attrs;
}

// =============================================================================
// Express Middleware Helper
// =============================================================================

/**
 * Middleware Express para injetar tenant no contexto OTel
 * 
 * @example
 * // Usar após o middleware de autenticação
 * app.use(isAuth);
 * app.use(otelTenantMiddleware);
 */
function createTenantMiddleware() {
    return (req: any, res: any, next: () => void) => {
        const tenantId = req.tenantId || req.user?.tenantId;

        if (tenantId) {
            const ctx = setTenantContext(tenantId);
            return context.with(ctx, () => {
                enrichActiveSpanWithContext();
                next();
            });
        }

        next();
    };
}

// =============================================================================
// Exportações
// =============================================================================

export {
    // Middleware
    createTenantMiddleware,
    // Enrichment
    enrichActiveSpanWithContext,
    getContextAttributes, getCurrentContextIds,
    // Getters
    getCurrentTenantId,
    getCurrentUserId,
    getCurrentWhatsAppId, runWithContext,
    // Runners
    runWithTenant, setFullContext,
    // Setters
    setTenantContext,
    setUserContext,
    setWhatsAppContext,
    // Context Keys (para casos avançados)
    TENANT_ID_KEY,
    USER_ID_KEY,
    WHATSAPP_ID_KEY
};

