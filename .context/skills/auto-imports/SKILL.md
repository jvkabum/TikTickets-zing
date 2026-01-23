---
type: skill
name: Frontend Auto-Imports Mastery
description: Guia técnico sobre o sistema de auto-imports (Vite/Quasar) do TikTickets-zing.
skillSlug: auto-imports
phases: [E]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 🚀 Frontend Auto-Imports Mastery

Este documento descreve como o sistema de auto-imports está configurado no **TikTickets-zing** (`frontend-vue-3`) e como utilizá-lo corretamente.

## 📦 O que é Auto-Importado?

Graças aos plugins `unplugin-auto-import` e `unplugin-vue-components`, você **não deve** importar manualmente os seguintes itens:

### 1. APIs do Vue e Ecossistema
- **Vue**: `ref`, `computed`, `watch`, `onMounted`, `nextTick`, etc.
- **Vue Router**: `useRouter`, `useRoute`.
- **Pinia**: `defineStore`, `storeToRefs`.
- **VueUse Core**: `useLocalStorage`, `useDark`, `useDebounceFn`, etc.
- **Vee-Validate & Yup**: `useForm`, `useField`, `object`, `string`, etc.

### 2. Utilitários do Quasar
- `useQuasar`, `Notify`, `Dialog`, `LocalStorage`, `Loading`.

### 3. Componentes Locais
Qualquer componente `.vue` localizado em:
- `src/components/**`
- `src/layouts/**`
- `src/pages/**` (Pastas específicas configuradas no `quasar.config.js`)

## 🛠 Como usar no código

### RUIM (Legado/Manual) ❌
```vue
<script>
import { ref } from 'vue' // DESNECESSÁRIO
import MyComponent from 'src/components/MyComponent.vue' // DESNECESSÁRIO

export default {
  components: { MyComponent },
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

### BOM (Padrão TikTickets-zing) ✅
```vue
<template>
  <!-- O componente MyComponent é resolvido automaticamente -->
  <MyComponent />
  <q-btn @click="count++">Contar: {{ count }}</q-btn>
</template>

<script setup>
// NENHUM IMPORT NECESSÁRIO!
const count = ref(0) // ref é global
const $q = useQuasar() // useQuasar é global
</script>
```

## 🔍 Onde a mágica acontece?
As definições estão centralizadas no arquivo `frontend-vue-3/quasar.config.js`.

Se você sentir que o VS Code não está reconhecendo uma variável:
1. Verifique se o servidor `npm run dev` está rodando.
2. Os arquivos `src/auto-imports.d.ts` e `src/components.d.ts` são atualizados automaticamente pelo Vite.

## 📝 Regras para Desenvolvedores
1. **Limpeza**: Remova imports manuais de funções nativas do Vue.
2. **Novos Componentes**: Ao criar uma pasta nova de componentes, certifique-se de adicioná-la no `viteConf.plugins` no `quasar.config.js` se ela não estiver coberta pelos padrões.
3. **Lint**: O projeto gera um arquivo `.eslintrc-auto-import.json` para que o ESLint não acuse erro de "variável não definida".
