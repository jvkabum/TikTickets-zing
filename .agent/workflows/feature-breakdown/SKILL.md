---
name: Decomposição de Funcionalidades (Feature Breakdown)
description: Divisão de funcionalidades complexas em tarefas implementáveis no TikTickets-zing
phases: [P]
---

# 📑 Decomposição de Funcionalidades (Feature Breakdown)

Esta skill guia o processo de planejamento e quebra de requisitos em tarefas técnicas granulares, facilitando a execução e o acompanhamento.

## 🧮 Processo de Decomposição

### 1. Análise de Impacto
- **Backend**: Identificar novos modelos, rotas, services e jobs (BullMQ).
- **Frontend**: Identificar novas views, componentes Quasar e chaves de estado (Pinia).
- **Database**: Definir se haverá necessidade de novas migrations.
- **WhatsApp**: Avaliar se a funcionalidade exige novas interações com a biblioteca `wwebjs`.

### 2. Definição da "Tarefa Atômica"
Uma tarefa deve ser pequena o suficiente para ser concluída em poucas horas e deve ter um resultado verificável.
- ✅ Exemplo: "Adicionar coluna `is_priority` ao modelo `Ticket` via migration".
- ❌ Exemplo: "Implementar sistema de tickets".

### 3. Checklist de Decomposição
- [ ] **Data Model**: As mudanças de esquema foram planejadas?
- [ ] **API Contracts**: Os endpoints foram desenhados?
- [ ] **UI/UX**: Os componentes necessários já existem no Quasar ou precisam ser criados?
- [ ] **Multi-tenancy**: A nova funcionalidade respeita o isolamento de `tenantId`?

## 📋 Modelo de Tarefa
Toda tarefa gerada deve conter:
- **Título**: Ação clara + Alvo.
- **Contexto**: O porquê da mudança.
- **Critérios de Aceitação**: Como saber que está pronto.
- **Relação com PREVC**: Em qual fase do workflow se encaixa.