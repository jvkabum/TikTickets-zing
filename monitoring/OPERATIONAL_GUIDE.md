# 📖 Guia Operacional de Observabilidade - TikTickets-zing

Este documento descreve como operar, validar e estender a stack de observabilidade implementada.

## 🕹️ Comandos Rápidos de Gerenciamento

### Iniciar tudo (Stack + Backend com OTel)
```bash
# Terminal 1: Infraestrutura
cd monitoring
docker-compose -f docker-compose.observability.yml up -d

# Terminal 2: Backend
cd backend
npm install
npm run dev
```

### Validar sem rodar a App completa
```bash
cd backend
npx ts-node -r ./src/telemetry/index.ts src/scripts/test-telemetry.ts
```

## 🛠️ Como Estender a Telemetria

### 1. Adicionar Atributos de Negócio a um Fluxo
Sempre utilize o utilitário `withSpan` para fluxos complexos.
```typescript
import { withSpan } from '../telemetry/tracer';

await withSpan('meu-fluxo-novo', async (span) => {
  span.setAttribute('meu_atributo', 'valor');
  // ... lógica
}, { tenant_id: 123 });
```

### 2. Registrar novas Métricas
Adicione a definição no `src/telemetry/metrics.ts` e use a função helper.
```typescript
// No metrics.ts
export const meuContador = meter.createCounter('meu_evento_total');

// No código
meuContador.add(1, { tenant_id: 'abc' });
```

### 3. Logging com Contexto Automático
Não é mais necessário passar o `tenant_id` manualmente se você estiver dentro de um span ou middleware de auth.
```typescript
import { logger } from '../telemetry/logger';

// O tenant_id será injetado automaticamente pelo OTel Context API
logger.info('Ação realizada com sucesso');
```

## 🔍 Troubleshooting (Onde olhar quando algo falha?)

| Problema | Onde Investigar | Comando |
|----------|-----------------|---------|
| OTLP não chega | Logs do OTel Collector | `docker logs otel-collector` |
| Logs não aparecem no Loki | Logs do Vector/Promtail | `docker logs vector` |
| Métricas vazias | Targets do Prometheus | http://localhost:9090/targets |
| Traces quebrados | Network Tab no Jaeger | http://localhost:16686 |

## 🛡️ Regras de Ouro
1. **Padrão de Nomenclatura**: Use `snake_case` para atributos e métricas.
2. **Privacidade**: Nunca logue senhas, tokens ou PII (Personal Identifiable Information) sem máscara.
3. **Cardinalidade**: Evite usar IDs únicos (como IDs de mensagem de WhatsApp) como labels de métricas no Prometheus. Use atributos de spans para dados de alta cardinalidade.
