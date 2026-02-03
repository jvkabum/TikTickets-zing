---
type: doc
name: rules-GEMINI
description: Regras fundamentais de comportamento, workflow PREVC e proatividade do agente
category: rules
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# Regras do Agente (GEMINI)

Este documento detalha as regras e diretrizes que o agente GEMINI segue, com base no ecossistema de contexto e ferramentas do AI Coders Academy. O agente opera com um foco rigoroso em especificações, segurança e um fluxo de trabalho estruturado.

## Diretrizes de Resposta

*   **Idioma**: Todas as interações e saídas do agente devem ser em Português do Brasil (PT-BR).
*   **Pensamento**: O raciocínio interno do agente será sempre conduzido em Português antes de qualquer ação ser executada.
*   **Filosofia**: O agente adere estritamente às filosofias de "Especificações antes do código" e "Sem suposições", garantindo que todas as ações sejam baseadas em requisitos claros e validados.

## Fluxo de Trabalho (PREVC)

O agente GEMINI não opera de forma autônoma sem supervisão. Ele segue um fluxo de trabalho de cinco etapas universais para garantir a qualidade e a conformidade do projeto:

1.  **P - Planejamento**: Definição clara do objetivo ("o que" será construído) antes de qualquer implementação de código.
2.  **R - Revisão**: Validação da arquitetura proposta e avaliação de riscos técnicos potenciais.
3.  **E - Execução**: Implementação do projeto de acordo com as especificações previamente aprovadas.
4.  **V - Validação**: Realização de testes, auditorias de segurança e revisão completa contra o plano original.
5.  **C - Confirmação**: Documentação das etapas, realização de commits e finalização do processo.

## Regras de Ação

*   **Ação Proativa**: O agente tem permissão para executar ferramentas de leitura e exploração do código sem a necessidade de solicitar aprovação prévia.
*   **Contexto Unificado**: O diretório `.context/` é a fonte primária e única de verdade para todos os playbooks, skills e documentação do projeto.
*   **Zero Placeholder**: Todo o conteúdo gerado deve ser real, técnico e funcional, evitando o uso de placeholders ou informações genéricas.
*   **Integridade**: É imperativo proteger absolutamente os arquivos de sessão do WhatsApp (`.wwebjs_auth`), garantindo sua integridade e confidencialidade.
*   **Foco Vue 3**: O desenvolvimento de front-end prioriza a utilização moderna do Vue 3 no diretório `frontend-vue-3`, com ênfase em "Wowed Aesthetics".

## Conectado ao Ecossistema

O agente GEMINI está integrado e utiliza o servidor MCP `ai-context` para orquestração de agentes e para manter a consistência e a sanidade do projeto. Em cenários onde o contexto necessite de atualização, o agente está configurado para realizar essas atualizações proativamente.
