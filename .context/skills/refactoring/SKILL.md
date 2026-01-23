---
type: skill
name: Refatoração (Refactoring)
description: Abordagem segura para refatoração de código legado no TikTickets-zing
skillSlug: refactoring
phases: [E]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# ♻️ Refatoração (Refactoring)

Guias para transformar código legado ou complexo em estruturas limpas, mantendo a compatibilidade e estabilidade.

## 📐 Princípios de Refatoração

### 1. Pequenos Passos
- Nunca realize grandes mudanças em um único commit. Utilize a estratégia "Make the change easy, then make the easy change".
- Mantenha os testes rodando (green) a cada pequeno ajuste.

### 2. Refatoração de Vue 2 -> Vue 3.5
- Migrar de **Options API** para **Script Setup** (Composition API).
- Substituir `propsData` e eventos ocultos por `defineProps` e `defineEmits`.
- Utilizar `computed` e `watch` de forma eficiente para evitar re-renderizações desnecessárias.

### 3. Desacoplamento de Lógica
- Extrair lógicas complexas de dentro dos Controllers para **Services** ou **Helpers**.
- Garantir que as funções sejam puras sempre que possível para facilitar a testabilidade.

## 📝 Checklists de Qualidade
- [ ] **Zero Regressão**: A funcionalidade original permanece idêntica após a refatoração?
- [ ] **Legibilidade**: O código ficou mais fácil de ler para um desenvolvedor júnior?
- [ ] **Performance**: Houve redução na complexidade ciclomática?
- [ ] **Documentação**: Comentários obsoletos foram removidos e o novo padrão foi documentado?

## 🚫 O que NÃO fazer
- Adicionar novas funcionalidades enquanto refatora.
- Ignorar erros de lint "porque o arquivo já era assim".
- Quebrar contratos de API sem atualizar o frontend simultaneamente.
