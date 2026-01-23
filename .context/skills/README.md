---
type: doc
name: AI Skills README
description: Guia de competências e procedimentos técnicos (Skills) para agentes de IA no TikTickets-zing
category: navigation
status: filled
generated: 2026-01-23
scaffoldVersion: "2.0.0"
---

# Skills

On-demand expertise for AI agents. Skills are task-specific procedures that get activated when relevant.

> Project: TikTickets-zing

## How Skills Work

1. **Discovery**: AI agents discover available skills
2. **Matching**: When a task matches a skill's description, it's activated
3. **Execution**: The skill's instructions guide the AI's behavior

## Available Skills

### Built-in Skills

| Skill | Description | Phases |
|-------|-------------|--------|
| [Mensagens de Commit (Commit Message)](./commit-message/SKILL.md) | Padrão sênior para mensagens de commit detalhadas e rastreáveis | C |
| [Revisão de PR (PR Review)](./pr-review/SKILL.md) | Padrão de revisão de Pull Requests contra padrões do TikTickets-zing | R, V |
| [Revisão de Código (Code Review)](./code-review/SKILL.md) | Padrões de revisão técnica e qualidade de código para o TikTickets-zing | R, V |
| [Geração de Testes (Test Generation)](./test-generation/SKILL.md) | Diretrizes para criação de suítes de testes robustas no TikTickets-zing | E, V |
| [Documentação Técnica (Documentation)](./documentation/SKILL.md) | Diretrizes para geração e atualização de documentação no TikTickets-zing | P, C |
| [Refatoração (Refactoring)](./refactoring/SKILL.md) | Abordagem segura para refatoração de código legado no TikTickets-zing | E |
| [Investigação de Erros (Bug Investigation)](./bug-investigation/SKILL.md) | Metodologia sistemática para identificação e resolução de bugs no TikTickets-zing | E, V |
| [Decomposição de Funcionalidades (Feature Breakdown)](./feature-breakdown/SKILL.md) | Divisão de funcionalidades complexas em tarefas implementáveis no TikTickets-zing | P |
| [Design de API (API Design)](./api-design/SKILL.md) | Criação de endpoints RESTful eficientes e seguros para o TikTickets-zing | P, R |
| [Auditoria de Segurança (Security Audit)](./security-audit/SKILL.md) | Checklist de revisão de segurança para código e infraestrutura do TikTickets-zing | R, V |

## Creating Custom Skills

Create a new skill by adding a directory with a `SKILL.md` file:

```
.context/skills/
└── my-skill/
    ├── SKILL.md          # Required: skill definition
    └── templates/        # Optional: helper resources
        └── checklist.md
```

### SKILL.md Format

```yaml
---
name: my-skill
description: When to use this skill
phases: [P, E, V]  # Optional: PREVC phases
mode: false        # Optional: mode command?
---

# My Skill

## When to Use
[Description of when this skill applies]

## Instructions
1. Step one
2. Step two

## Examples
[Usage examples]
```

## PREVC Phase Mapping

| Phase | Name | Skills |
|-------|------|--------|
| P | Planning | feature-breakdown, documentation, api-design |
| R | Review | pr-review, code-review, api-design, security-audit |
| E | Execution | commit-message, test-generation, refactoring, bug-investigation |
| V | Validation | pr-review, code-review, test-generation, security-audit |
| C | Confirmation | commit-message, documentation |
