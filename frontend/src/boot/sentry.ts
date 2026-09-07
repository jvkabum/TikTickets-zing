import * as Sentry from "@sentry/vue";
import { boot } from 'quasar/wrappers';

/**
 * 🛡️ Sentry Boot File
 * Configura o monitoramento de erros e performance direto no frontend.
 * Adaptado para Vue 3 / Quasar 2 com as configurações fornecidas.
 */
export default boot(({ app, router }) => {
  // Nota: Priorizamos o DSN fornecido no exemplo, mas permitimos override por env
  const SENTRY_DSN = process.env.VUE_SENTRY_DSN || "https://362610dc5ab76bba5e2c3db07dfda11e@o4510819566485504.ingest.us.sentry.io/4510822953058304";

  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN não encontrado. O monitoramento de erros está desativado.');
    return;
  }

  Sentry.init({
    app,
    dsn: SENTRY_DSN,

    // Configuração solicitada: Permite envio de dados de IP e outros PII
    sendDefaultPii: true,

    integrations: [
      Sentry.browserTracingIntegration({
        router,
        // Configura para qual domínio os headers de rastreamento devem ser enviados.
        // Isso permite ao Sentry ligar o erro do frontend à transação do backend.
        tracePropagationTargets: ["localhost", /^\//, process.env.VUE_URL_API || ""],
      }),
      Sentry.replayIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // Configurado conforme solicitação (10%)
    replaysOnErrorSampleRate: 1.0, // Configurado conforme solicitação (100% em erro)

    // Ambiente
    environment: process.env.NODE_ENV || 'development',

    // Versão da release
    release: 'tiktickets-frontend@' + (process.env.npm_package_version || '3.2.4'),
  });

  // Exemplos de Métricas solicitadas
  Sentry.metrics.count('frontend_boot_count', 1);
  Sentry.metrics.gauge('frontend_init_time', performance.now());

  // Recupera usuário do localStorage para manter contexto em refresh
  try {
    const userData = JSON.parse(localStorage.getItem('usuario'));
    if (userData && userData.id) {
      Sentry.setUser({
        id: userData.id,
        email: userData.email,
        username: userData.name,
        tenantId: userData.tenantId
      });
    }
  } catch (e) {
    // Silencioso
  }

  console.log('[Sentry] Inicializado com sucesso para o frontend (Vue 3)');
});
