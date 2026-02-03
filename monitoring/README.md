# 🔭 TikTickets-zing - Stack de Observabilidade

Stack completa de observabilidade usando OpenTelemetry como camada única de abstração.

## 📋 Componentes

| Componente | Porta | Função |
|------------|-------|--------|
| **OTel Collector** | 4317 (gRPC), 4318 (HTTP) | Hub central de telemetria |
| **Prometheus** | 9090 | Backend de métricas |
| **Loki** | 3100 | Backend de logs |
| **Jaeger** | 16686 (UI), 14250 (gRPC) | Backend de traces |
| **Grafana** | 3001 | Visualização e dashboards |
| **Vector** | - | Coleta de logs de infraestrutura |

## 🏗️ Arquitetura

```
┌─────────────────────────┐
│  TikTickets Backend     │
│  (OpenTelemetry SDK)    │
└───────────┬─────────────┘
            │ OTLP (gRPC/HTTP)
            ▼
┌─────────────────────────┐
│  OpenTelemetry Collector │
│  (Hub Central)          │
└─────┬─────┬─────┬───────┘
      │     │     │
      ▼     ▼     ▼
┌─────────────────────────────────────────┐
│  Prometheus  │  Loki   │  Jaeger        │
│  (métricas)  │ (logs)  │  (traces)      │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│        Grafana          │
│   (Visualização)        │
└─────────────────────────┘
```

## 🚀 Quick Start

### 1. Iniciar a Stack de Observabilidade

```bash
cd monitoring
docker-compose -f docker-compose.observability.yml up -d
```

### 2. Verificar Status

```bash
docker-compose -f docker-compose.observability.yml ps
```

### 3. Acessar Interfaces

- **Grafana**: http://localhost:3001 (admin / tiktickets2024)
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

### 4. Configurar Backend

Adicione ao `.env` do backend:

```env
OTEL_SDK_DISABLED=false
OTEL_SERVICE_NAME=tiktickets-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

### 5. Iniciar Backend com Telemetria

O backend já inclui a importação da telemetria. Basta iniciar normalmente:

```bash
cd backend
npm run dev
```

## 📊 Dashboards Disponíveis

### TikTickets - Overview
- Request Rate por rota
- Error Rate
- Latência P50/P95/P99
- Sessões WhatsApp ativas
- Conexões Socket.io por tenant
- Logs de erro recentes

## 🔍 Correlação de Sinais

A stack suporta correlação completa entre:

1. **Trace → Log**: Clique em um trace no Jaeger e veja os logs relacionados
2. **Log → Trace**: Clique no trace_id em um log no Loki/Grafana
3. **Metric → Trace**: Exemplars no Prometheus linkam para traces
4. **Error → Trace**: Erros no Sentry incluem link para trace

### Exemplo de Query Correlacionada no Grafana

```logql
{service_namespace="tiktickets"} | json | trace_id != ""
```

## 🛠️ Instrumentação no Código

### Criar Span Customizado

```typescript
import { withSpan } from './telemetry/tracer';

const result = await withSpan('process-message', async (span) => {
  span.setAttribute('message_type', 'text');
  return await processMessage(message);
}, { tenant_id: tenantId });
```

### Registrar Métrica

```typescript
import { recordWhatsAppMessageSent } from './telemetry/metrics';

recordWhatsAppMessageSent(tenantId, whatsappId);
```

### Log com Contexto

```typescript
import { logWithContext } from './telemetry/logger';

logWithContext('info', 'Mensagem enviada', {
  tenant_id: tenantId,
  ticket_id: ticketId,
});
```

## 🔧 Manutenção

### Limpar Dados

```bash
# Para todos os containers e volumes
docker-compose -f docker-compose.observability.yml down -v
```

### Ver Logs do Collector

```bash
docker logs otel-collector -f
```

### Reload de Configuração do Prometheus

```bash
curl -X POST http://localhost:9090/-/reload
```

## 📚 Referências

- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Grafana Loki](https://grafana.com/docs/loki/latest/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)

## ⚠️ Regras Não-Negociáveis

1. ❌ A aplicação **NUNCA** se comunica diretamente com Prometheus/Loki/Jaeger
2. ✅ A aplicação usa **APENAS** OpenTelemetry SDK
3. ✅ OTel Collector é o **hub central** de toda telemetria
4. ✅ Todo log/métrica/trace inclui `trace_id` e `tenant_id`
