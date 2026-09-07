import { boot } from 'quasar/wrappers';
import './../telemetry/index';

/**
 * 🔭 OpenTelemetry Boot File
 * Inicializa o rastreamento assim que a app Vue 3 sobe.
 */
export default boot(async ({ app }) => {
    // A telemetria é inicializada pelo import automático acima
    console.log('[OTel] Boot Telemetry Loaded (Vue 3)');

    // Opcional: Adicionar tracer global para uso nos componentes
    // app.config.globalProperties.$tracer = tracer;
});
