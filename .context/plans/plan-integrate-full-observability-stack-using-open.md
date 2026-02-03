---
status: filled
generated: 2026-02-02
agents:
  - type: "architect-specialist"
    role: "Desenhar arquitetura de observabilidade agnóstica de backend"
  - type: "devops-specialist"
    role: "Implementar infraestrutura de coleta (OTel Collector, Vector)"
  - type: "backend-specialist"
    role: "Instrumentar aplicação com OpenTelemetry SDK"
  - type: "performance-optimizer"
    role: "Criar dashboards e alertas para monitoramento proativo"
  - type: "security-auditor"
    role: "Validar isolamento de tenants na telemetria"
  - type: "test-writer"
    role: "Criar testes de verificação de telemetria"
  - type: "documentation-writer"
    role: "Documentar operações e runbooks"
docs:
  - "architecture.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
phases:
  - id: "phase-1-discovery"
    name: "Discovery & Architecture Design"
    prevc: "P"
  - id: "phase-2-infrastructure"
    name: "Infrastructure Setup"
    prevc: "E"
  - id: "phase-3-instrumentation"
    name: "Application Instrumentation"
    prevc: "E"
  - id: "phase-4-validation"
    name: "Validation & Dashboards"
    prevc: "V"
  - id: "phase-5-completion"
    name: "Documentation & Handoff"
    prevc: "C"
---

# Plano: Integração de Stack de Observabilidade Enterprise

> Integração completa de observabilidade usando OpenTelemetry como padrão único de instrumentação, com backends Grafana, Prometheus, Loki, Jaeger, Sentry e Vector.

## Task Snapshot

- **Primary goal:** Implementar observabilidade completa (logs, métricas, traces, errors) no TikTickets-zing usando OpenTelemetry como camada única de abstração, permitindo correlação total entre todos os sinais.
- **Success signal:** 
  - Traces E2E visíveis no Jaeger com span_id/trace_id propagados
  - Logs no Loki correlacionados com traces via trace_id
  - Métricas no Prometheus com labels de tenant e operação
  - Erros no Sentry linkados a traces específicos
  - Dashboards no Grafana com drill-down entre sinais
- **Key references:**
  - [Architecture Documentation](../docs/architecture.md)
  - [Data Flow](../docs/data-flow.md)
  - [Security](../docs/security.md)

---

## Arquitetura de Observabilidade

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TikTickets-zing Application                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     OpenTelemetry SDK (Node.js)                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Tracer     │  │   Meter      │  │   Logger     │               │    │
│  │  │  (traces)    │  │  (metrics)   │  │   (logs)     │               │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │    │
│  │         │                 │                 │                        │    │
│  │         └─────────────────┴─────────────────┘                        │    │
│  │                           │                                          │    │
│  │                    OTLP (gRPC/HTTP)                                  │    │
│  └───────────────────────────┼──────────────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      OpenTelemetry Collector (Hub Central)                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Receivers:                                                              │  │
│  │   - otlp (gRPC:4317, HTTP:4318)                                        │  │
│  │                                                                         │  │
│  │ Processors:                                                             │  │
│  │   - batch           (agrupa telemetria)                                │  │
│  │   - memory_limiter  (proteção de memória)                              │  │
│  │   - attributes      (enriquece com tenant_id, service.name)            │  │
│  │   - filter          (remove dados sensíveis)                           │  │
│  │   - tail_sampling   (amostragem inteligente de traces)                 │  │
│  │                                                                         │  │
│  │ Exporters:                                                              │  │
│  │   ├─ prometheusremotewrite → Prometheus (:9090)                        │  │
│  │   ├─ loki                  → Loki (:3100)                              │  │
│  │   ├─ otlp/jaeger           → Jaeger (:4317)                            │  │
│  │   └─ sentry                → Sentry (error tracking)                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┬───────────────────┐
           ▼                   ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐
│   Prometheus     │  │      Loki        │  │     Jaeger       │  │  Sentry  │
│   (métricas)     │  │     (logs)       │  │    (traces)      │  │ (errors) │
│     :9090        │  │     :3100        │  │     :16686       │  │  cloud   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └──────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Grafana (Visualização)                             │
│                              :3001                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Dashboards     │  │ Alerting       │  │ Explore        │                 │
│  │ - API Perf     │  │ - SLO/SLI      │  │ - Log Search   │                 │
│  │ - WhatsApp     │  │ - Anomalias    │  │ - Trace View   │                 │
│  │ - Tenants      │  │ - P99 Latency  │  │ - Correlation  │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        Vector (Logs de Sistema)                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Sources:                                                                │  │
│  │   - docker_logs (containers)                                           │  │
│  │   - file (nginx, postgres logs)                                        │  │
│  │   - journald (systemd)                                                 │  │
│  │                                                                         │  │
│  │ Transforms:                                                             │  │
│  │   - parse (estruturação)                                               │  │
│  │   - filter (remove ruído)                                              │  │
│  │   - label (adiciona metadados)                                         │  │
│  │                                                                         │  │
│  │ Sinks:                                                                  │  │
│  │   - loki (logs de infra)                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Regras Arquiteturais (NÃO NEGOCIÁVEIS)

| Regra | Descrição | Validação |
|-------|-----------|-----------|
| **R1** | Aplicação NUNCA se comunica diretamente com Prometheus/Loki/Jaeger/Sentry | Grep no código por imports diretos |
| **R2** | Aplicação usa APENAS OpenTelemetry SDK | Único ponto de instrumentação |
| **R3** | OTel Collector é o hub central de toda telemetria | Diagrama de rede validado |
| **R4** | Correlação obrigatória: trace_id + span_id em logs e métricas | Testes de correlação |
| **R5** | Arquitetura agnóstica de backend | Jaeger→Tempo, Prometheus→Mimir sem mudança de código |
| **R6** | Sentry exclusivo para error tracking (não observabilidade geral) | Configuração do exporter |

---

## Contexto do Sistema TikTickets-zing

### Características Críticas para Observabilidade

| Característica | Impacto na Observabilidade |
|----------------|---------------------------|
| **Multi-tenancy** | Labels `tenant_id` obrigatórios em TODA telemetria |
| **WhatsApp Engine (Wbot)** | Sessões long-lived, métricas de conexão, traces de fluxos |
| **Socket.io (Real-time)** | Métricas de conexões ativas, latência de eventos |
| **RabbitMQ** | Traces distribuídos entre workers, métricas de filas |
| **Puppeteer (QR Code)** | Métricas de uso de recursos, memory leaks |
| **PostgreSQL** | Métricas de conexões, query performance |
| **Redis** | Métricas de cache hit/miss, pub/sub latency |

### Pontos de Instrumentação Identificados

```
backend/
├── src/
│   ├── server.ts              # Entry point → trace root spans
│   ├── app/
│   │   ├── index.ts           # HTTP server → trace middleware
│   │   └── express.ts         # Express → auto-instrumentation
│   ├── libs/
│   │   ├── socket.ts          # Socket.io → custom spans
│   │   ├── wbot.ts            # WhatsApp → session spans
│   │   └── rabbitmq-server.ts # RabbitMQ → context propagation
│   ├── services/
│   │   └── WbotServices/      # Critical flows → detailed traces
│   ├── controllers/           # API endpoints → HTTP spans
│   ├── middleware/
│   │   └── isAuth.ts          # Auth → add tenant_id to context
│   └── utils/
│       └── logger.ts          # REPLACE Winston → OTel Logger
```

---

## Agent Lineup

| Agent | Fase | Responsabilidade |
|-------|------|------------------|
| **Architect Specialist** | P | Validar arquitetura, definir padrões de propagação de contexto |
| **DevOps Specialist** | E | Deploy OTel Collector, configurar exporters, integrar Vector |
| **Backend Specialist** | E | Instrumentar código Node.js com OTel SDK |
| **Performance Optimizer** | V | Criar dashboards, definir SLOs, configurar alertas |
| **Security Auditor** | V | Validar isolamento de tenant_id, redação de dados sensíveis |
| **Test Writer** | V | Testes de correlação trace↔log↔metric |
| **Documentation Writer** | C | Runbooks, documentação de operações |

---

## Phases

### Phase 1 — Discovery & Architecture Design (P)

**Owner:** Architect Specialist

**Steps:**
1. [ ] Validar diagrama de arquitetura com regras não-negociáveis
2. [ ] Definir estratégia de propagação de contexto (trace_id, tenant_id)
3. [ ] Mapear todos os pontos de instrumentação (API, Socket.io, Wbot, RabbitMQ)
4. [ ] Definir convenções de naming para spans, métricas e logs
5. [ ] Criar ADR (Architecture Decision Record) para escolhas de observabilidade

**Deliverables:**
- `docs/adr/ADR-001-observability-architecture.md`
- `docs/observability/naming-conventions.md`
- Lista de pontos de instrumentação aprovada

**Commit Checkpoint:** `chore(plan): complete phase 1 - observability architecture design`

---

### Phase 2 — Infrastructure Setup (E)

**Owner:** DevOps Specialist

**Steps:**
1. [ ] Criar `docker-compose.observability.yml` com toda stack
2. [ ] Configurar OpenTelemetry Collector (`otel-collector-config.yaml`)
3. [ ] Configurar Prometheus com retention e scrape configs
4. [ ] Configurar Loki com retention e labels
5. [ ] Configurar Jaeger com storage
6. [ ] Configurar Grafana com datasources e dashboards
7. [ ] Configurar Vector para logs de infraestrutura
8. [ ] Integrar Sentry exporter no OTel Collector

**Arquivos a Criar:**
```
monitoring/
├── docker-compose.observability.yml
├── otel-collector/
│   └── config.yaml
├── prometheus/
│   └── prometheus.yml
├── loki/
│   └── loki-config.yaml
├── jaeger/
│   └── README.md
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasources.yaml
│       └── dashboards/
│           ├── dashboard.yaml
│           └── json/
│               ├── tiktickets-overview.json
│               ├── whatsapp-sessions.json
│               └── api-performance.json
└── vector/
    └── vector.toml
```

**Commit Checkpoint:** `feat(infra): setup observability stack infrastructure`

---

### Phase 3 — Application Instrumentation (E)

**Owner:** Backend Specialist

**Steps:**
1. [ ] Instalar dependências OTel no backend
   ```bash
   npm install @opentelemetry/sdk-node \
               @opentelemetry/auto-instrumentations-node \
               @opentelemetry/exporter-trace-otlp-grpc \
               @opentelemetry/exporter-metrics-otlp-grpc \
               @opentelemetry/exporter-logs-otlp-grpc \
               @opentelemetry/api-logs \
               @opentelemetry/instrumentation-socket.io
   ```

2. [ ] Criar `backend/src/telemetry/index.ts` (bootstrap OTel SDK)
3. [ ] Criar `backend/src/telemetry/logger.ts` (substituir Winston)
4. [ ] Criar `backend/src/telemetry/tracer.ts` (custom spans)
5. [ ] Criar `backend/src/telemetry/metrics.ts` (custom metrics)
6. [ ] Modificar `backend/src/server.ts` para inicializar telemetria PRIMEIRO
7. [ ] Instrumentar `isAuth.ts` para propagar tenant_id no contexto
8. [ ] Instrumentar `wbot.ts` com spans de sessão
9. [ ] Instrumentar `rabbitmq-server.ts` com context propagation
10. [ ] Instrumentar `socket.ts` com métricas de conexão

**Arquivos a Criar:**
```
backend/src/telemetry/
├── index.ts         # Bootstrap OTel SDK
├── logger.ts        # OTel-based logger (substitui logger.ts)
├── tracer.ts        # Helper para criar spans customizados
├── metrics.ts       # Métricas customizadas
├── propagation.ts   # Context propagation utilities
└── resource.ts      # Resource attributes (service.name, etc)
```

**Commit Checkpoint:** `feat(otel): instrument backend with OpenTelemetry SDK`

---

### Phase 4 — Validation & Dashboards (V)

**Owner:** Performance Optimizer + Security Auditor

**Steps:**
1. [ ] Validar correlação trace_id em logs, métricas e traces
2. [ ] Verificar isolamento de tenant_id (sem vazamento entre tenants)
3. [ ] Criar dashboards Grafana:
   - Overview do sistema
   - Performance de APIs
   - Sessões WhatsApp
   - Métricas por tenant
   - Health checks de conexões
4. [ ] Configurar alertas:
   - P99 latency > 500ms
   - Error rate > 1%
   - WhatsApp disconnect rate
   - Queue depth RabbitMQ
5. [ ] Documentar SLOs/SLIs

**Commit Checkpoint:** `feat(observability): add dashboards and alerting`

---

### Phase 5 — Documentation & Handoff (C)

**Owner:** Documentation Writer

**Steps:**
1. [ ] Criar runbook de troubleshooting
2. [ ] Documentar como usar Grafana Explore para debug
3. [ ] Documentar como correlacionar erro → trace → log
4. [ ] Atualizar `docs/architecture.md` com seção de observabilidade
5. [ ] Criar guia de on-call com alertas e ações

**Commit Checkpoint:** `docs(observability): add runbooks and operational guide`

---

## Estimativa de Recursos

| Phase | Esforço | Tempo Calendário | Skills Necessários |
|-------|---------|------------------|-------------------|
| Phase 1 | 1 dia | 1-2 dias | Arquitetura, OTel |
| Phase 2 | 2 dias | 3-4 dias | Docker, Infra |
| Phase 3 | 3 dias | 5-7 dias | Node.js, OTel SDK |
| Phase 4 | 2 dias | 3-4 dias | Grafana, PromQL |
| Phase 5 | 1 dia | 1-2 dias | Documentação |
| **Total** | **9 dias** | **13-19 dias** | - |

---

## Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Overhead de telemetria em produção | Médio | Alto | Tail sampling, batch processing |
| Quebra de isolamento de tenant | Baixo | Crítico | Testes de segurança, code review |
| Aumento de uso de memória | Médio | Médio | Memory limiter no Collector |
| Incompatibilidade de versões OTel | Baixo | Médio | Pin de versões, testes de integração |
| Latência adicional em requests | Médio | Médio | Async export, sampling |

---

## Rollback Plan

### Rollback Triggers
- Performance degradation > 20%
- Memory usage > 150% do baseline
- Error rate aumentando devido à instrumentação

### Rollback Procedure
1. Desabilitar `OTEL_SDK_DISABLED=true` no `.env`
2. Reverter imports de telemetria no `server.ts`
3. Restaurar `logger.ts` original
4. Manter infraestrutura de monitoramento (sem custo se não há telemetria)

---

## Evidence & Follow-up

### Artifacts Esperados
- [ ] `docker-compose.observability.yml` funcional
- [ ] Screenshots dos dashboards funcionando
- [ ] Logs de validação mostrando correlação
- [ ] PR com toda instrumentação
- [ ] ADR documentando decisões

### Métricas de Sucesso
- Traces E2E de request HTTP → response visíveis no Jaeger
- Logs com trace_id pesquisáveis no Loki
- Métricas de latência p99 visíveis no Grafana
- Erros capturados no Sentry com link para trace
