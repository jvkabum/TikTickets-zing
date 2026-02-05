# 📊 TikTickets-zing - Observabilidade

Stack de observabilidade simplificada para o TikTickets-zing.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │
│   (Vue 3 + OTel)│     │  (Node.js + OTel)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │      OTLP (gRPC/HTTP) │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   OTel Collector      │
         │   (Port 4317/4318)    │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    SigNoz       │     │     Sentry      │
│  (ClickHouse)   │     │    (Cloud)      │
│  Traces, Logs,  │     │   Erros de      │
│    Métricas     │     │    Código       │
└─────────────────┘     └─────────────────┘
```

## Componentes

| Componente | Função | URL/Porta |
|---|---|---|
| **SigNoz** | Traces, Logs, Métricas | `signoz.autotick.com.br` |
| **Sentry** | Erros de código com IA | `tikanais.sentry.io` |
| **OTel Collector** | Hub central de telemetria | `4317` (gRPC), `4318` (HTTP) |
| **ClickHouse** | Banco de dados do SigNoz | Interno |

## Arquivos

```
monitoring/
├── docker-compose.yaml           # Stack principal (SigNoz)
├── otel-collector/
│   └── config.yaml               # Configuração do OTel Collector
├── README.md                     # Este arquivo
├── README_OBSERVABILITY.md       # Guia de instalação no Coolify
├── OPERATIONAL_GUIDE.md          # Guia operacional
└── .env.observability.example    # Exemplo de variáveis de ambiente
```

## Quick Start

```bash
# Subir a stack
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

## Documentação

- [Guia de Instalação no Coolify](./README_OBSERVABILITY.md)
- [Guia Operacional](./OPERATIONAL_GUIDE.md)
- [SigNoz Docs](https://signoz.io/docs/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Sentry Docs](https://docs.sentry.io/)
