---
type: plan
name: Paridade Visual do Atendimento Chat
description: Garantir que a tela de atendimento do Vue 3 seja idêntica ou superior à versão legada
planSlug: paridade-visual-atendimento-chat-v4
phase: P
status: pending
generated: 2026-01-23
---

# Plano: Paridade Visual do Atendimento Chat

Este plano visa analisar as discrepâncias visuais e funcionais entre o frontend legado (Vue 2) e o novo (Vue 3/Quasar) na tela de Atendimento, garantindo que o novo sistema mantenha todas as funcionalidades originais com uma estética superior.

## Objetivos e Escopo
- **Objetivo**: Atingir 100% de paridade funcional e superioridade visual na tela de Atendimento do `frontend-vue-3`.
- **Escopo**:
    - Comparação de layouts (Imagens enviadas vs. Código).
    - Ajuste de componentes: `TicketList.vue`, `ItemTicket.vue`, `InforCabecalhoChat.vue`.
    - Verificação de estados de pesquisa e filtros.
    - Garantia de que elementos como o botão de "Novo Ticket" e filtros de abas funcionem como no original.

## Fases da Implementação

### Fase 1: Análise e Diagnóstico (Planning)
- **Agente**: `migration-comparison-specialist`
- **Ações**: 
    - Comparar o código de `frontend/src/pages/atendimento` com `frontend-vue-3/src/pages/atendimento`.
    - Identificar elementos faltantes ou com estilo divergente com base nas fotos enviadas.
- **Entrega**: Lista de discrepâncias técnicas.

### Fase 2: Ajuste de Arquitetura e UI (Review)
- **Agente**: `architect-specialist` e `vue3-quasar-specialist`
- **Ações**: 
    - Definir as correções de layout mantendo os novos padrões do Quasar.
    - Revisar o fluxo de dados dos tickets (Pinia vs. Vuex legado).
- **Entrega**: Especificação técnica das mudanças.

### Fase 3: Ajuste de Componentes (Execution)
- **Agente**: `frontend-specialist`
- **Ações**: 
    - Refatorar CSS e estrutura de slots nos componentes identificados.
    - Alinhar cores, espaçamentos e ícones com a referência original.
- **Entrega**: Componentes atualizados.

### Fase 4: Validação Estética (Validation)
- **Agente**: `code-reviewer`
- **Ações**: 
    - Comparar o resultado final com as imagens de referência.
    - Verificar responsividade e micro-animações.
- **Entrega**: Interface validada.

## Critérios de Sucesso
- [ ] Listagem de tickets idêntica ou superior à original em termos de usabilidade.
- [ ] Cabeçalho do chat contendo todas as informações e ações do sistema antigo.
- [ ] Campo de pesquisa e tabs de status (Abertos, Pendentes, etc) totalmente funcionais.
- [ ] Estética "Wowed" aplicada corretamente sobre a estrutura funcional clássica.

## Plano de Rollback
- **Gatilho**: Quebra de funcionalidade crítica de mensageria ou erro de renderização massivo.
- **Procedimento**: Reverter commits específicos de UI e restaurar estados de componente via Git.
