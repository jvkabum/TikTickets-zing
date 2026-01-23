---
type: skill
name: Quasar 2, Composition API & Pinia Mastery
description: Guia definitivo para desenvolvimento frontend moderno no TikTickets-zing
skillSlug: quasar2-composition-pinia
phases: [P, E, R]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 🛠 Quasar 2, Composition API & Pinia Mastery

Este guia define os padrões de excelência para o desenvolvimento do frontend do **TikTickets-zing**, utilizando Vue 3.5, Quasar 2 e Pinia.

## 🏗 Estrutura da Store (Pinia)

Priorizamos o **Setup Store** (estilo Composition API) para manter a consistência com os componentes.

### Padrão de Definição
- Use `defineStore` com uma função anônima.
- `ref()` para estado (state).
- `computed()` para getters.
- `function()` para ações (actions).
- Retorne apenas o que for necessário externamente.

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExemploStore = defineStore('exemplo', () => {
  // State
  const itens = ref([])
  const loading = ref(false)

  // Getters
  const totalItens = computed(() => itens.value.length)

  // Actions
  async function carregarItens() {
    loading.value = true
    try {
      const { data } = await api.get('/itens')
      itens.value = data
    } finally {
      loading.value = false
    }
  }

  return { itens, loading, totalItens, carregarItens }
})
```

## 🧩 Componentes Quasar 2

Aproveite o poder do Quasar CLI e seus plugins globais.

### Melhores Práticas
1. **Auto-imports**: Não importe `ref`, `computed`, `onMounted`, etc. O projeto usa auto-import.
2. **Propriedades Reativas**: Use `toRefs` ou `toRef` se precisar desestruturar props mantendo reatividade.
3. **Notify & Dialog**: Use o plugin `$q` via const `{ $q } = useQuasar()`.

### Template Base do Componente
```vue
<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12" v-if="loading">
        <q-inner-loading :showing="true">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </div>
      
      <div class="col-12 col-md-6" v-else v-for="item in itens" :key="item.id">
        <q-card flat bordered class="my-card hover-shadow">
          <q-card-section>
            <div class="text-h6">{{ item.nome }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useExemploStore } from 'src/stores/useExemploStore'

// Hooks e Stores
const $q = useQuasar()
const store = useExemploStore()

// State desestruturado (usando reatividade da store)
const { itens, loading } = storeToRefs(store)

// Ciclo de Vida
onMounted(async () => {
  try {
    await store.carregarItens()
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar dados'
    })
  }
})
</script>
```

## 💅 Design e Estética (Premium UI)

- **Gradients**: Use variáves CSS no `index.css` para temas modernos.
*   **Animações**: Utilize `<transition>` do Vue ou classes `animate__` do Quasar.
*   **Shadows**: Use `shadow-1` até `shadow-24` ou sombras personalizadas via CSS.
*   **Glassmorphism**: 
    ```css
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    ```

## 🚦 Roteamento e Guards
- Use `useRouter` e `useRoute` dentro de `setup`.
- Defina metadados (como `requiresAuth`) em `src/router/routes.js` e trate no `index.js` do router.

## 📝 Regras de Ouro
1. **KISS (Keep It Simple, Stupid)**: Componentes com mais de 300 linhas devem ser divididos.
2. **Logic Separation**: Lógica pesada de dados vai para a **Store**. Lógica de UI repetitiva vai para **Composables**.
3. **No Placeholders**: Sempre use dados reais ou gere imagens via ferramenta se necessário.
4. **Clean Code**: Use nomes descritivos para funções. Ex: `handleLogin` em vez de `submit`.
