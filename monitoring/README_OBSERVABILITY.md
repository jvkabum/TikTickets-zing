# 📊 TikTickets-zing - Guia de Observabilidade

Stack de monitoramento simplificada usando **SigNoz** + **Sentry**.

## 🚀 Componentes

| Componente | Função | Porta |
|---|---|---|
| **SigNoz** | Traces, Logs e Métricas (tudo em um) | `3301` |
| **ClickHouse** | Banco de dados ultra-rápido | `8123`, `9000` |
| **OTel Collector** | Recebe dados do app e envia para SigNoz | `4317`, `4318` |
| **Sentry** | Erros de código com IA e sourcemaps | Cloud |

---

## 🛠️ Instalação no Coolify

### 1. Criar novo Recurso
1. Vá em **Project** → **Environment**.
2. Clique em **+ New Resource** → **Docker Compose**.
3. Cole o conteúdo do `docker-compose.yaml`.
4. Nome sugerido: `observability-signoz`.

### 2. Variáveis de Ambiente
| Variável | Descrição |
|---|---|
| `SENTRY_DSN` | DSN do Sentry Cloud |

### 3. Configuração de Domínio
Configure o FQDN para o SigNoz:
- **URL:** `signoz.autotick.com.br`
- **Porta:** `3301`

### 4. Configurações Críticas
- **Base Directory:** `/`
- **Docker Compose Location:** `/docker-compose.yaml`
- **Preserve repository:** ✅ **ENABLED**

---

## 🔍 Verificação

1. **SigNoz:** Acesse `https://signoz.autotick.com.br`
   - Navegue em **Traces** para ver requisições
   - Navegue em **Logs** para ver logs do backend
   - Navegue em **Metrics** para ver métricas

2. **Sentry:** Acesse `https://tikanais.sentry.io`
   - Verifique erros de código
   - Use o "Vidente" para correções automáticas

---

## 📦 O Que Foi Removido

A stack anterior incluía 6+ containers:
- ~~Jaeger~~ → Substituído por SigNoz Traces
- ~~Loki~~ → Substituído por SigNoz Logs
- ~~Prometheus~~ → Substituído por SigNoz Metrics
- ~~Grafana~~ → Substituído por SigNoz UI
- ~~Vector~~ → Não mais necessário
- ~~GlitchTip~~ → Substituído por Sentry Cloud

**Resultado:** De 6+ containers para 4 (Zookeeper, ClickHouse, SigNoz, OTel Collector).

---

## 💡 Recursos Necessários

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **RAM** | 4GB | 8GB+ |
| **CPU** | 2 núcleos | 4+ núcleos |
| **Disco** | 20GB | 50GB+ (depende da retenção) |

---

## 🔄 Rollback

Se precisar voltar para a stack antiga:

1. Restaure o backup da pasta `monitoring/`
2. Execute: `docker-compose up -d`

---

## 📞 Suporte

- [SigNoz Docs](https://signoz.io/docs/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Sentry Docs](https://docs.sentry.io/)
