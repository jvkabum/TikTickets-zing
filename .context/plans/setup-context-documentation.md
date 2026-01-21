# Plano: Inicialização de Contexto Inteligente (TikTickets-zing)

Este plano detalha as etapas para configurar e preencher a documentação do projeto TikTickets-zing no diretório `.context`, utilizando o fluxo PREVC para garantir que o agente de IA tenha total compreensão da arquitetura e regras de negócio.

## Objetivo e Escopo
- **Meta**: Ter 100% da documentação estrutural e playbooks de agentes preenchidos e precisos.
- **Escopo**: Diretório `.context/`, incluindo `docs/`, `agents/` e `skills/`.

## Fases de Execução

### Fase 1: Descoberta e Mapeamento (Planejamento)
- **Objetivo**: Mapear a arquitetura atual do backend (Node.js/TypeScript) e dos frontends (Vue 2 e Vue 3).
- **Passos**:
  1. Analisar os principais serviços em `backend/src/services/WbotServices`. [Responsável: `architect-specialist`]
  2. Mapear o fluxo de dados entre o servidor e o socket em `backend/src/libs/socketChat`. [Responsável: `architect-specialist`]
  3. Criar a visão geral do projeto em `docs/project-overview.md`. [Responsável: `documentation-writer`]
- **Entregável**: Estrutura inicial de documentação mapeada.
- **Commit**: `chore(plan): mapeamento inicial de arquitetura concluído`

### Fase 2: Geração de Conteúdo e Playbooks (Execução)
- **Objetivo**: Preencher os arquivos com detalhes técnicos reais.
- **Passos**:
  1. Detalhar a arquitetura em `docs/architecture.md` com foco em Multi-Tenancy e canais (WhatsApp, Telegram, etc). [Responsável: `backend-specialist`]
  2. Configurar os playbooks dos agentes em `agents/` para que saibam lidar com as especificidades do TikTickets. [Responsável: `documentation-writer`]
  3. Preencher as habilidades em `skills/` para automação de tarefas recorrentes. [Responsável: `solo-dev`]
- **Entregável**: Documentação e Agentes configurados.
- **Commit**: `feat(context): documentação e playbooks preenchidos`

### Fase 3: Validação e Refinamento (Validação)
- **Objetivo**: Garantir que as informações estão corretas e úteis para a IA.
- **Passos**:
  1. Revisar os documentos gerados contra o código real. [Responsável: `code-reviewer`]
  2. Testar a eficácia dos agentes com perguntas complexas sobre o código. [Responsável: `solo-dev`]
- **Entregável**: Contexto validado e pronto para uso em produção.
- **Commit**: `chore(context): validação de contexto concluída`

## Critérios de Sucesso
- Todos os arquivos em `.context/docs` devem estar preenchidos (sem TODOs genéricos).
- Os agentes em `.context/agents` devem ter instruções específicas para o ecossistema TikTickets.
- O fluxo PREVC deve estar ativo e rastreando as ações.

## Plano de Rollback
- Em caso de erros graves no scaffolding, excluir a pasta `.context` e reiniciar o `init` com parâmetros reduzidos.
- Manter backup das regras originais em `.agent/rules`.
