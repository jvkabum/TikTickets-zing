# Plano: Commit de Infraestrutura de Contexto Sênior

Este plano detalha o processo de consolidação e commit da nova infraestrutura de contexto do TikTickets-zing, garantindo que todo o conhecimento técnico e playbooks de agentes sênior sejam preservados no repositório.

## Objetivos e Escopo
- **Objetivo**: Commitar 48+ arquivos do diretório `.context/` que foram criados ou atualizados para o nível Sênior.
- **Escopo**: 
  - Playbooks de 17 Agentes (`.context/agents/`).
  - Habilidades técnicas (Skills) preenchidas (`.context/skills/`).
  - Documentações de API, Banco de Dados e Deploy (`.context/docs/`).
  - Regras do Agente (GEMINI) atualizadas.

## Fases da Implementação

### Fase 1: Auditoria Final (Review)
- **Agente**: `code-reviewer`
- **Ações**: 
  - Verificar se todos os arquivos estão em PT-BR.
  - Validar se os axiomas dos agentes estão consistentes.
  - Confirmar se o mapeamento da API em `api.md` está completo.
- **Entrega**: Aprovação dos arquivos para commit.

### Fase 2: Preparação do Commit (Execution)
- **Agente**: `documentation-writer`
- **Ações**: 
  - Executar `git add .context/`.
  - Gerar mensagem de commit conforme a skill `commit-message`.
  - Agrupar mudanças em um commit atômico e explicativo.
- **Entrega**: Arquivos em stage prontos para o commit.

### Fase 3: Validação do Repositório (Validation)
- **Agente**: `test-writer`
- **Ações**: 
  - Garantir que nenhum arquivo sensível (como `.wwebjs_auth`) foi adicionado por engano (verificar `.gitignore`).
  - Validar se o comando `git status` está limpo após o commit.
- **Entrega**: Repositório estável e documentado.

## Critérios de Sucesso
- [ ] Todos os 17 agentes sênior estão presentes no repositório.
- [ ] O arquivo `api.md` reflete fielmente as rotas do backend.
- [ ] O commit segue o formato `docs(context): upgrade agents to senior level and complete API mapping`.
- [ ] O sistema de fluxo PREVC está operando com as novas regras.

## Plano de Rollback
- **Gatilho**: Inconsistência grave nos arquivos ou detecção de dados sensíveis commitados.
- **Procedimento**: `git reset --soft HEAD~1` e limpeza do stage.

---
**Evidence & Follow-up**
- Artifacts: Git log, .context directory structure.
- Follow-up: Atualizar o README principal do projeto referenciando o novo diretório .context.
