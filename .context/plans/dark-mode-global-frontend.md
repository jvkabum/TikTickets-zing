---
type: plan
title: Implementação Global de Dark Mode Premium
summary: Este plano detalha a expansão do suporte ao Modo Escuro (Dark Mode) Premium e Glassmorphism para todo o projeto frontend-vue-3, unificando a experiência visual estabelecida no Dashboard em todos os módulos do sistema.
status: in_progress
progress: 75
generated: 2026-01-24
agents:
  - type: "architect-specialist"
    role: "Definir a estrutura global de tokens CSS e padrões de design"
  - type: "frontend-specialist"
    role: "Implementar os estilos Glassmorphism e adaptar componentes Vue"
  - type: "documentation-writer"
    role: "Atualizar os playbooks de design e walkthroughs técnicas"
lastUpdated: "2026-01-24T03:20:00.000Z"
---

# 🚀 Plano de Implementação Global de Dark Mode Premium

Este plano visa transformar a interface do TikTickets em uma experiência Premium consistente, estendendo o layout cristalino (Glassmorphism) e o Modo Escuro dinâmico para além do Dashboard, cobrindo todo o `frontend-vue-3`.

## 🎯 Objetivos-Chave
- **Unificação Visual**: Garantir que as telas de Atendimento, Configurações e Relatórios sigam o mesmo padrão estético elevado do Dashboard.
- **Reatividade Zero-Reload**: Manter a troca de tema instantânea (sem recarregamento da página) implementada via Pinia e Quasar Dark plugin.
- **Glassmorphism Sistêmico**: Aplicar desfoque de fundo (backdrop-filter) e bordas translúcidas em todos os modais, drawers e cards.
- **Contraste Acessível**: Garantir que o Modo Escuro mantenha legibilidade WCAG em todos os elementos de texto e ícones.

## 🛠 Fases de Implementação

### Fase 1: Fundação Estética (Design System) [DONE]
**Objetivo**: Padronizar as variáveis globais de cor e utilitários de design no `app.sass`.

### Fase 2: Layouts e Navegação (Estratégia Cross-App) [DONE]
**Objetivo**: Adaptar os containers principais e menus laterais.
- [x] **MainLayout e Sidebar**: Aplicar o efeito de transparência e desfoque no `MainLayout.vue` e `MainSidebar.vue`.
- [x] **Transitions Globais**: Implementar transições de fade suave na transição entre rotas (`router-view`).
- [x] **Correções de Socket**: Evitar desconexões globais ao navegar.

### Fase 3: Refatoração de Componentes e Módulos [DONE]
**Objetivo**: Migrar cada módulo para o novo padrão visual.
- [x] **Módulo de Atendimento**: Adaptar a lista de tickets e a área de chat para o background translúcido.
- [x] **Modais e Diálogos**: Refatorar os componentes de `boot` e diálogos globais (`$q.dialog`) para o estilo "Modal Clean".
- [x] **Tabelas e Listas**: Garantir que `q-table` e `q-list` em todo o frontend herdem o estilo transparente/glass.

### Fase 4: Polimento e Validação (BI & UX) [IN_PROGRESS]
**Objetivo**: Eliminar ruídos visuais e validar a performance.

**Tarefas**
1. **Audit de Contraste**: Verificar textos em cinza que podem "sumir" no fundo ejetado do modo escuro.
2. **Resíduos Brancos**: Localizar elementos com `bg-white` fixo e converter para classes dinâmicas.
3. **Performance de Blur**: Validar se o excesso de `backdrop-filter` impacta a fluidez em browsers móveis.

**Commit Checkpoint**: `style(ui): polimento final de contraste e correção de resíduos visuais`

## 📋 Critérios de Sucesso
- Troca de tema instantânea funcionando em todas as páginas sem erros de "readonly".
- Consistência de desfoque (blur) entre diferentes navegadores (Chrome/Edge/Firefox).
- Feedback visual de "Glass" perceptível tanto no tema Lite quanto no Dark.

## Execution History

> Last updated: 2026-01-24T03:20:00.000Z | Progress: 75%

### phase-2 [DONE]
- Completed: 2026-01-24T03:20:00.000Z

### phase-3 [DONE]
- Completed: 2026-01-24T03:20:00.000Z
