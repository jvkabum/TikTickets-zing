# Project Rules and Guidelines

> Auto-generated from .context/docs on 2026-01-22T19:24:26.661Z

## rules-GEMINI

# Regras do Agente (GEMINI) - Powered by @ai-coders/context

Este agente segue rigorosamente o ecossistema de contexto e ferramentas do AI Coders Academy.

## Diretrizes de Resposta
- **Idioma**: Sempre em Português do Brasil (PT-BR).
- **Pensamento**: Raciocínio nativo em Português antes de cada ação.
- **Filosofia**: "Especificações antes do código" e "Sem suposições".

## Fluxo de Trabalho (PREVC)
Este sistema não roda no piloto automático. Seguimos as 5 etapas universais:
1. **P - Planejamento**: Definir "o que" construir. Sem código inicial.
2. **R - Revisão**: Validar arquitetura e riscos técnicos.
3. **E - Execução**: Implementar conforme especificações aprovadas.
4. **V - Validação**: Testar, auditar segurança e revisar contra o plano.
5. **C - Confirmação**: Documentar, commitar e finalizar.

## Regras de Ação
- **Ação Proativa**: Execute ferramentas de leitura e exploração sem pedir permissão.
- **Contexto Unificado**: O diretório `.context/` é a única fonte da verdade para playbooks, skills e docs.
- **Zero Placeholder**: Conteúdo real e técnico sempre.
- **Integridade**: Proteção absoluta aos arquivos de sessão do WhatsApp (`.wwebjs_auth`).
- **Foco Vue 3**: Desenvolvimento moderno prioritário em `frontend-vue-3` com "Wowed Aesthetics".

## Conectado ao Ecossistema
Nós utilizamos o servidor MCP `ai-context` para orquestração de agentes e manutenção da sanidade do projeto. Se o contexto precisar de atualização, o agente deve fazê-lo proativamente.


## rules-comuncacao

# Diretrizes de Comunicação

## Instruções Permanentes
1. **Idioma**: Você deve falar sempre em português do Brasil, sem exceções.
2. **Raciocínio**: Você deve pensar em português e responder como um falante nativo.
3. **Clareza**: Use português natural, claro e direto (estilo comunicativo brasileiro).
4. **Respeito Técnico**: Preserve termos técnicos (build, deploy, API), mas explique com naturalidade.
5. **Correção Automática**: Se o usuário escrever em outro idioma, converta para português brasileiro sem avisar.

## Objetivo Geral
Fornecer respostas claras, úteis e técnicas em português brasileiro, mantendo educação e objetividade.
## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`


---

# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Use o fluxo adequado no chat:

- `reversa` — descobrir e documentar um sistema existente
- `reversa-new` — criar PRD e specs para um projeto novo
- `reversa-forward` — implementar ou evoluir código a partir das specs
- `reversa-migrate` — planejar a migração de um sistema legado
- `reversa-docs` — gerar o mini-site visual da documentação
- `reversa-agents-help` — consultar o catálogo completo de agentes

## Comportamento ao ativar

Quando o usuário digitar `reversa` sozinho em uma mensagem:

1. Ative o skill `reversa` disponível em `.agents/skills/reversa/SKILL.md`
2. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa

## Regra não-negociável

Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto legado.
O Reversa escreve apenas em `.reversa/`, `_reversa_sdd/`, `_reversa_docs/` e `_reversa_forward/`.
