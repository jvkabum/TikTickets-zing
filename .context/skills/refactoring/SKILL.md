# Habilidade: Refatoração (Refactoring)

Guia para modernização de código e melhoria de qualidade sem quebra de comportamento.

## Foco Principal: Migração Vue 2 -> Vue 3.5
- **Conversão de API**: Mudar de Options API (`data`, `methods`, `computed`) para Composition API (`ref`, `reactive`, `computed`, `onMounted`).
- **Store**: Migrar lógica de `Vuex` para `Pinia`.
- **Componentes Quasar**: Atualizar props (ex: `v-model:model-value` em vez de apenas `v-model` se necessário, dependendo da versão específica).
- **Estética**: Ao refatorar, aplique gradientes modernos e sombras suaves conforme o padrão "Premium".

## Regras de Segurança na Refatoração
- **Não alterar lógica de negócio**: O comportamento esperado deve permanecer exatamente o mesmo.
- **Passo a Passo**: Não refatore arquivos gigantes de uma vez. Vá componente por componente.
- **Verificação**: Teste a funcionalidade após cada alteração importante.

## O Que Refatorar?
- Código com muitos `any` no TypeScript.
- Funções com mais de 50 linhas.
- Componentes com lógica excessiva que poderiam ser `composables` (hooks).
- Lógica de WhatsApp dispersa fora da `libs/wbot.ts`.
