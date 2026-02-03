# Plano de Implementação: Correção da Listagem de Condições no Chatbot

Este plano descreve as etapas para corrigir o problema onde as listas de 'Usuários' e 'Filas' aparecem vazias nas condições do construtor de Chatbot.

## 1. Descoberta e Análise (P)

### Objetivo
Identificar a falha exata no mapeamento de dados entre o Pinia Store e o componente de visualização.

### Etapas
1.  **Validar Estado do Store**: Confirmar que o `useChatFlowStore.js` possui as propriedades `usuarios` e `filas` no estado e que elas são populadas pela ação `setFlowData`.
2.  **Inspecionar Componente Pai**: Analisar como o `panel.vue` consome o store.
3.  **Mapeamento de Props**: Verificar a passagem de props para `node_form.vue`.

**Deliverables**: Identificação da causa raiz (confirmada como erro de acesso ao objeto redundante `cDataFlow`).

## 2. Execução: Correção do Mapeamento (E)

### Objetivo
Ajustar o componente `panel.vue` para extrair e passar os dados corretamente.

### Etapas
1.  **Modificar `panel.vue`**:
    -   Atualizar a desestruturação de `storeToRefs(chatFlowStore)` para incluir `usuarios` e `filas`.
    -   Passar essas novas refs diretamente para o componente `flow-node-form`.
2.  **Verificar `node_form.vue`**: Garantir que as props recebidas são utilizadas corretamente nos `q-select` de condições.

**Assignee**: frontend-specialist

**Commit Checkpoint**: `fix(frontend): adjust user and queue listing in chatbot builder`

## 3. Validação e Verificação (V)

### Objetivo
Garantir que as listas estão sendo carregadas e exibidas corretamente.

### Etapas
1.  **Teste Manual**:
    -   Abrir o editor de fluxo.
    -   Adicionar uma condição do tipo 'Usuário' e verificar se a lista suspensa exibe os usuários da plataforma.
    -   Adicionar uma condição do tipo 'Fila' e verificar se a lista suspensa exibe as filas.
2.  **Verificação de Reatividade**: Garantir que, se os dados no store mudarem, o builder reflita a mudança.

**Assignee**: qa-agent

## 4. Critérios de Sucesso
-   O dropdown "Usuário" em Condições exibe a lista completa de usuários.
-   O dropdown "Fila" em Condições exibe a lista completa de filas.
-   Nenhum erro de console relacionado a "property undefined" ao abrir o builder.

## Plano de Rollback
Reverter a alteração no `panel.vue` usando `git checkout src/components/ccFlowBuilder/panel.vue`.

## Execution History

> Last updated: 2026-02-02T19:07:25.961Z | Progress: 100%

### E [DONE]
- Started: 2026-02-02T19:07:08.842Z
- Completed: 2026-02-02T19:07:08.842Z

- [x] Step 1: Step 1 *(2026-02-02T19:07:08.842Z)*
  - Notes: Ajustado o componente 'panel.vue' para extrair corretamente 'usuarios' e 'filas' do useChatFlowStore via storeToRefs e passá-los como props para o 'flow-node-form'. Anteriormente o código tentava acessar essas propriedades dentro de 'cDataFlow' (que aponta apenas para a propriedade 'flow' do estado), o que resultava em listas vazias.

### phase-2 [DONE]
- Started: 2026-02-02T19:07:25.961Z
- Completed: 2026-02-02T19:07:25.961Z

- [x] Step 1: Step 1 *(2026-02-02T19:07:25.961Z)*
  - Notes: Ajustado o mapeamento de dados no panel.vue para usar as propriedades corretas do store.
