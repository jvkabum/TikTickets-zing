---
type: doc
name: development-workflow
description: Processos diários de engenharia, branching e diretrizes de contribuição
category: workflow
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Fluxo de Desenvolvimento

Este documento descreve as práticas recomendadas e os processos diários para contribuir com o projeto **TikTickets-zing**, garantindo consistência e qualidade no código.

## Fluxo de Trabalho de Desenvolvimento

O processo de engenharia diário segue uma abordagem estruturada:

1. **Seleção de Tarefa**: Escolha uma tarefa pendente ou bug reportado.
2. **Análise de Impacto**: Avalie como a mudança afeta o isolamento de tenants (Multi-tenancy) e a estabilidade das conexões de mensageria.
3. **Desenvolvimento**: Implemente a solução seguindo os padrões de código (TypeScript, Clean Code).
4. **Verificação Local**: Execute o backend e o frontend para validar a alteração manualmente.
5. **Documentação**: Atualize documentos relevantes no `.context/docs/` se houver mudanças na arquitetura ou fluxos.

## Branching & Releases

Utilizamos um modelo baseado em **Git Flow simplificado**:

- **`main`**: Reflete o código em produção. Estável e pronto para deploy.
- **`develop`**: Branch de integração para novas funcionalidades.
- **Feature Branches (`feat/nome-da-feature`)**: Criadas a partir da `develop` para trabalho isolado.
- **Bugfix Branches (`fix/descricao-do-bug`)**: Criadas a partir da `develop` ou `main` (hotfix) para correções.
- **Tagging**: Versões estáveis são marcadas com tags semânticas (ex: `v2.1.0`).

## Desenvolvimento Local

Para configurar o ambiente de desenvolvimento, siga estes comandos:

### Backend
- **Instalar dependências**: `npm install` (dentro da pasta `backend`)
- **Configurar variáveis**: Copie o `.env.example` para `.env` e ajuste as credenciais do banco e Redis.
- **Executar em modo dev**: `npm run dev`
- **Build**: `npm run build`

### Frontend (Vue 3)
- **Instalar dependências**: `npm install` (dentro da pasta `frontend-vue-3`)
- **Executar em modo dev**: `npx quasar dev` ou `npm run dev`
- **Build**: `npm run build`

## Expectativas de Revisão de Código

Todo Pull Request (PR) deve ser revisado criteriosamente. Os revisores devem focar em:

- **Isolamento de Tenant**: Verificar se o `tenantId` está sendo filtrado corretamente em todas as queries.
- **Segurança**: Garantir que middlewares de autenticação estão presentes e que inputs estão sanitizados.
- **Performance**: Evitar N+1 queries e garantir o uso eficiente de recursos no frontend.
- **Estilo**: O código deve seguir as convenções de linting estabelecidas.
- **Testes**: Idealmente, novas funcionalidades devem vir acompanhadas de testes unitários ou de integração.

## Tarefas de Onboarding

Se você é novo no projeto:
1. Configure seu ambiente local conforme o [getting-started.md](./getting-started.md).
2. Explore o [glossary.md](./glossary.md) para entender os termos técnicos.
3. Tente reproduzir um bug conhecido ou implementar uma melhoria pequena na interface para familiarizar-se com o Quasar Framework e a Service Layer do backend.

## Recursos Relacionados
- [testing-strategy.md](./testing-strategy.md)
- [tooling.md](./tooling.md)
- [getting-started.md](./getting-started.md)
