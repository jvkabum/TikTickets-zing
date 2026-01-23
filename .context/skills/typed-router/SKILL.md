---
type: skill
name: Typed Router Mastery (unplugin-vue-router)
description: Implementação de roteamento baseado em arquivos com tipagem estrita via unplugin-vue-router.
skillSlug: typed-router
phases: [P, E, R]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 🛣 Typed Router Mastery (unplugin-vue-router)

Este guia define o padrão para o sistema de roteamento moderno do **TikTickets-zing**, utilizando o roteamento automático baseado em arquivos.

## 📁 Estrutura de Arquivos
O roteamento agora é derivado automaticamente da pasta `src/pages`.

- `src/pages/index.vue` -> `/`
- `src/pages/atendimento/index.vue` -> `/atendimento`
- `src/pages/atendimento/[id].vue` -> `/atendimento/:id` (Rota Dinâmica)
- `src/pages/atendimento/[...path].vue` -> `/atendimento/*` (Catch-all)

## 💎 Vantagens do unplugin-vue-router
1. **Tipagem Automática**: O router gera tipos para todas as rotas em `src/typed-router.d.ts`.
2. **Data Fetching (Loaders)**: Suporte nativo para `defineLoader` para buscar dados antes do componente montar.
3. **Menos Boilerplate**: Não há necessidade de editar o `routes.js` manualmente toda vez que criar uma tela.

## 🛠 Como usar

### Navegação Tipada
```vue
<script setup>
// O hook useRouter agora retorna um roteador tipado
const router = useRouter()

function irParaDashboard() {
  // O compilador vai sugerir os nomes das rotas disponíveis!
  router.push({ name: '/dashboard/' })
}
</script>
```

### Definição de Meta-dados
Para definir meta-dados (como `requiresAuth`), use a macro `definePage`:
```vue
<script setup>
definePage({
  meta: {
    requiresAuth: true,
    layout: 'MainLayout'
  }
})
</script>
```

### Data Loading (Loader)
```vue
<script setup>
// Define um loader para buscar os dados do ticket
export const useTicketLoader = defineLoader(async (to) => {
  const ticketId = to.params.id
  return await api.get(`/tickets/${ticketId}`)
})

// O dado já vem tipado e pronto para uso
const { data: ticket, isLoading } = useTicketLoader()
</script>
```

## 📝 Regras de Ouro
1. **Nomenclatura**: Siga a convenção de pastas do Quasar em `src/pages` para rotas limpas.
2. **Macros**: Use `definePage` sempre que precisar customizar o comportamento da rota.
3. **Tipos**: Sempre use links tipados (`<router-link :to="{ name: '/...' }">`) para evitar erros em runtime.
