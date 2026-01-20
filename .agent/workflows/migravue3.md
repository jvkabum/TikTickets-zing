---
description: migraçao para vue 3.5
---

Quero que você atue como um especialista sênior em Vue.js, Quasar, SPA, Pinia, Composition API, Vite e migrações front-end.

Eu tenho dois projetos de frontend:

um antigo usando Vue 2.7 + Quasar 1 + Options API

um novo usando Vue 3 + Quasar 2 + Composition API + Pinia + Vite

O objetivo agora é corrigir todos os bugs e funções faltando após a migração.

1. O que você vai fazer

Compare o código do frontend antigo com o novo e identifique:

funções que existiam antes e não existem mais

diferenças de lógica entre os componentes

erros de adaptação Options API → Composition API

diferenças no comportamento do Quasar (QInput, QSelect, QDialog, QTable, Notify, Dialog, Loading etc.)

mudanças no router (VueRouter → createRouter)

mudanças no store (Vuex → Pinia)

eventos perdidos (socket, mitt, eventBus)

mixins não convertidos em composables

watchers, filters e computed que sumiram

problemas de PWA e Service Worker

perda de props, emits e model-value

2. O que você deve entregar

O output deve conter:

[A] Relatório de Comparação

Para cada arquivo encontrado nos dois projetos, informar:

o que existe no antigo e não existe no novo

o que existe no novo mas diferente do antigo

funções renomeadas ou removidas

imports alterados

mudanças críticas de API

[B] Lista de Bugs e Quebras de Funcionalidade

Exemplos esperados:

- QDialog não abre porque v-model foi substituído por model-value
- Eventos de socket "chat:typing" não existem mais no novo
- Axios interceptors não foram carregados
- PWA não registra o service worker
- Falta persistência no store Pinia
- Página /settings não existe mais

[C] Diferenças de API Vue/Quasar Pinia

Listar problemas como:

Vue2 filters removidos → converter para computed
Vuex actions perderam payload
Vue.use(...) não funciona no Vue 3
this.$set(...) foi removido
.sync removido no Vue 3
@input virou @update:model-value
watch deep mudou a sintaxe

[D] Sugestões de Correção

Devolver sugestões claras com código quando necessário, exemplo:

// Correção do QDialog no Vue 3
<q-dialog v-model="showDialog">  ❌ (Vue 2)
<q-dialog v-model:modelValue="showDialog"> ✔ (Vue 3)

[E] Checklist Final

Criar um checklist com:

dependências compatíveis

dependências quebradas

funcionalidades faltando

ajustes obrigatórios

ajustes opcionais

3. Regras importantes

não omitir nada

não resumir

justificar tecnicamente cada diferença

identificar riscos e impactos reais no runtime

não responder até eu enviar os dois códigos

Quando eu enviar os projetos no formato:

# FRONTEND ANTIGO
(código aqui)

# FRONTEND NOVO
(código aqui)


Você deve iniciar imediatamente a comparação seguindo tudo acima.