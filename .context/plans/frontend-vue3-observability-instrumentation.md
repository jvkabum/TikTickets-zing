# Plano: Instrumentação de Observabilidade no Frontend Vue 3

Este plano detalha a implementação do OpenTelemetry (OTel) no projeto **frontend-vue-3** (Vite + Vue 3 + Pinia + Quasar 2), conectando-o à stack de monitoramento centralizada do TikTickets-zing.

## 🎯 Objetivos
- Implementar Rastreamento Distribuído (Distributed Tracing) de ponta a ponta (Browser → Backend → DB).
- Coletar métricas de Web Vitals e performance da UI.
- Correlacionar erros do frontend com traces do backend.
- Garantir que `tenant_id` seja propagado em todas as requisições.

## 🏗️ Arquitetura de Telemetria
1. **SDK**: OpenTelemetry Web SDK.
2. **Context**: ZoneContextManager para rastreio assíncrono.
3. **Propagation**: W3C Trace Context (padrão) + B3 para compatibilidade.
4. **Export**: OTLP/HTTP via porta 4318 (Collector).

---

## 📅 Fases do Plano

### Fase 1: Preparação e Dependências
- **Ações**:
  1. Instalar pacotes: `@opentelemetry/api`, `@opentelemetry/sdk-trace-web`, `@opentelemetry/instrumentation-fetch`, `@opentelemetry/instrumentation-xml-http-request`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/context-zone`.
  2. Verificar permissões de CORS no OTel Collector (já configurado no passo anterior).
- **Responsável**: `frontend-specialist`
- **Output**: `package.json` atualizado.

### Fase 2: Implementação do Core (SDK Web)
- **Ações**:
  1. Criar `src/telemetry/index.ts` com o bootstrap do WebTracerProvider.
  2. Configurar `propagateTraceHeaderCorsUrls` para as URLs do backend.
  3. Adicionar atributos globais: `service.name=tiktickets-frontend-vue3`, `service.namespace=tiktickets`.
- **Responsável**: `architect-specialist` / `frontend-specialist`
- **Output**: `src/telemetry/index.ts`

### Fase 3: Integração Quasar 2 (Boot/Plugin)
- **Ações**:
  1. Criar boot file `src/boot/telemetry.ts` (Vue 3 / Quasar 2 style).
  2. Registrar no `quasar.config.js`.
  3. Implementar interceptor no Pinia/Axios para garantir que `tenant_id` seja injetado no contexto do span ativo.
- **Responsável**: `frontend-specialist`
- **Output**: `src/boot/telemetry.ts` e `quasar.config.js`.

### Fase 4: Validação End-to-End
- **Ações**:
  1. Realizar uma requisição do frontend e verificar no Jaeger se o trace ID é o mesmo no backend.
  2. Validar se métricas de navegação estão chegando no Prometheus.
- **Responsável**: `qa-specialist`
- **Output**: Relatório de Validação.

---

## 🛠️ Regras Técnicas (Não-Negociáveis)
1. **Performance**: O SDK não deve bloquear a renderização inicial (carregar de forma assíncrona se possível).
2. **Segurança**: Nunca enviar tokens de autenticação como atributos de span.
3. **Propagação**: Usar obrigatoriamente `propagateTraceHeaderCorsUrls` para evitar falhas de CORS no navegador.

## 🔍 Critérios de Sucesso
- [ ] Trace ID visível no Header da requisição (Network tab).
- [ ] Span "tiktickets-frontend-vue3" visível no Jaeger.
- [ ] Correlação completa frontend -> backend funcionando.
- [ ] Nenhuma degradação perceptível no Lighthouse (Performance).

## Execution History

> Last updated: 2026-02-02T22:58:51.188Z | Progress: 100%

### phase-3-instrumentation [DONE]
- Started: 2026-02-02T22:58:51.188Z
- Completed: 2026-02-02T22:58:51.188Z

- [x] Step 3: Step 3 *(2026-02-02T22:58:51.188Z)*
  - Output: frontend-vue-3/src/telemetry/index.ts, frontend-vue-3/src/boot/telemetry.ts, frontend-vue-3/quasar.config.js
  - Notes: Instrumentação do Frontend Vue 3 concluída. Configurado SDK Web, propagação de headers e integração com Quasar 2 boot. Remoção de arquivos errados no frontend Vue 2 executada.
