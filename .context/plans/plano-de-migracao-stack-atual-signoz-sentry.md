---
status: unfilled
progress: 100
generated: 2026-02-03
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "bug-fixer"
    role: "Analyze bug reports and error messages"
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "refactoring-specialist"
    role: "Identify code smells and improvement opportunities"
  - type: "test-writer"
    role: "Write comprehensive unit and integration tests"
  - type: "documentation-writer"
    role: "Create clear, comprehensive documentation"
  - type: "performance-optimizer"
    role: "Identify performance bottlenecks"
  - type: "security-auditor"
    role: "Identify security vulnerabilities"
  - type: "backend-specialist"
    role: "Design and implement server-side architecture"
  - type: "frontend-specialist"
    role: "Design and implement user interfaces"
  - type: "architect-specialist"
    role: "Design overall system architecture and patterns"
  - type: "devops-specialist"
    role: "Design and maintain CI/CD pipelines"
  - type: "database-specialist"
    role: "Design and optimize database schemas"
  - type: "mobile-specialist"
    role: "Develop native and cross-platform mobile applications"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
  - "tooling.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
lastUpdated: "2026-02-04T03:26:48.705Z"
---

# Plano de Migração: Stack Atual → SigNoz + Sentry

> 📋 Migrar a stack de observabilidade (Jaeger, Loki, Prometheus, Grafana, Vector) para **SigNoz**, mantendo o **Sentry** para erros de código.

## Task Snapshot
- **Primary goal:** Simplificar a infraestrutura de monitoramento, reduzindo de 6+ containers para 3, sem perder visibilidade.
- **Success signal:** Traces, Logs e Métricas aparecendo no painel do SigNoz; Sentry continua capturando erros normalmente.
- **Key references:**
  - [SigNoz Docs](https://signoz.io/docs/)
  - [Monitoring Folder](../../../monitoring/)
  - [OTel Collector Config](../../../monitoring/otel-collector/)

## O Que Será Removido
| Container | Função Atual | Substituto |
| --- | --- | --- |
| Jaeger | Rastreamento (Traces) | SigNoz Traces |
| Loki | Banco de Logs | SigNoz Logs |
| Prometheus | Métricas | SigNoz Metrics |
| Grafana | Interface Visual | SigNoz UI |
| Vector | Coletor de Logs | OTel Collector |

## O Que Será Mantido
- **Sentry:** Para erros de código, sourcemaps e o "Vidente" de IA.
- **OpenTelemetry Collector:** Será reconfigurado para apontar para o SigNoz.

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| ClickHouse consumir muita RAM | Média | Alto | Testar em paralelo antes de desligar stack antiga |
| Perda de dashboards do Grafana | Alta | Baixo | Exportar JSONs antes da migração |
| SigNoz não receber dados corretamente | Baixa | Alto | Rodar envio duplo (OTel para ambos) por 48h |

### Dependencies
- **Técnica:** VPS no Coolify com pelo menos 4GB RAM livre.
- **Externa:** Nenhuma (SigNoz é self-hosted).

## Working Phases

### Phase 1 — Preparação (PREVC: P - Planning)
**Steps**
1. [x] Fazer backup da pasta `monitoring/`.
2. [ ] Verificar RAM disponível no VPS do Coolify.
3. [ ] Exportar dashboards do Grafana (JSON) para backup.
4. [ ] Documentar endpoints atuais do `otel-collector/config.yaml`.

**Commit Checkpoint:** `git commit -m "chore(monitoring): backup pre-signoz migration"`

---

### Phase 2 — Instalação Paralela (PREVC: E - Execution)
**Steps**
1. [x] Criar `docker-compose.signoz.yaml` baseado no template oficial. *(completed: 2026-02-03T21:21:14.220Z)*
2. [ ] Subir SigNoz em paralelo (sem desligar a stack antiga).
3. [ ] Testar acesso à UI do SigNoz na porta `3301`.
4. [ ] Modificar `otel-collector/config.yaml` para envio DUPLO (Jaeger + SigNoz).
5. [ ] Reiniciar o `otel-collector` e verificar logs.

**Commit Checkpoint:** `git commit -m "feat(monitoring): add signoz parallel stack"`

---

### Phase 3 — Validação (PREVC: V - Validation)
**Steps**
1. [ ] Comparar traces no SigNoz vs Jaeger (mesmos IDs).
2. [ ] Comparar logs no SigNoz vs Loki (mesmas mensagens).
3. [ ] Criar um alerta de teste no SigNoz.
4. [ ] Validar que o Sentry continua funcionando normalmente.
5. [ ] Aguardar 24-48h de operação paralela.

**Commit Checkpoint:** `git commit -m "test(monitoring): validate signoz data integrity"`

---

### Phase 4 — Corte (PREVC: C - Confirmation)
**Steps**
1. [ ] Remover exporters antigos do `otel-collector/config.yaml`.
2. [ ] `docker-compose down` nos serviços: `jaeger`, `loki`, `prometheus`, `grafana`, `vector`.
3. [ ] Remover pastas de config antigas (opcional, manter backup).
4. [ ] Atualizar `README_OBSERVABILITY.md` e `OPERATIONAL_GUIDE.md`.
5. [ ] Configurar retenção de dados no SigNoz (ex: 7 dias).

**Commit Checkpoint:** `git commit -m "chore(monitoring): complete signoz migration"`

---

## Rollback Plan

### Rollback Triggers
- SigNoz não recebendo dados após 48h de operação paralela.
- Consumo de RAM do ClickHouse prejudicando o backend.
- Funcionalidades críticas ausentes no SigNoz.

### Rollback Procedure
1. Parar contêineres do SigNoz: `docker-compose -f docker-compose.signoz.yaml down`
2. Restaurar `otel-collector/config.yaml` do backup.
3. Reiniciar stack antiga: `docker-compose up -d`
4. Documentar motivo da falha para análise futura.

## Execution History

> Last updated: 2026-02-04T03:26:48.705Z | Progress: 100%

### phase-2 [DONE]
- Started: 2026-02-03T21:21:14.220Z
- Completed: 2026-02-04T03:26:48.705Z

- [x] Step 1: Step 1 *(2026-02-04T03:26:48.705Z)*
  - Output: monitoring/docker-compose.yaml
  - Notes: Configuração do SigNoz atualizada e corrigida (v0.60.0/v0.111.24 + JWT_SECRET). Próximo passo: usuáro deve rodar docker-compose para validar.

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: TODO: Revert commits, restore database to pre-migration snapshot
- Data Impact: TODO: Describe any data loss or consistency concerns
- Estimated Time: TODO: e.g., 2-4 hours

#### Phase 3 Rollback
- Action: TODO: Full deployment rollback, restore previous version
- Data Impact: TODO: Document data synchronization requirements
- Estimated Time: TODO: e.g., 1-2 hours

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

## Evidence & Follow-up

List artifacts to collect (logs, PR links, test runs, design notes). Record follow-up actions or owners.
