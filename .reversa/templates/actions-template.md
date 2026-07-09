<!--
Template de corpo do actions.md
Carregado por /reversa-to-do e atualizado por /reversa-coding.

REGRAS DE PREENCHIMENTO:
- IDs estáveis: T001, T002, ..., zero-padded três dígitos. Nunca recicle.
- Marcador de paralelismo é [//] no início da linha de ID. Tarefas [//] não compartilham arquivo alvo.
- Coluna "Dependências" lista IDs separados por vírgula. Ações sem dependência usam "-".
- Status inicial é [ ]. /reversa-coding muda para [X] ao concluir.
- Toda ação precisa ser ATÔMICA: cabe num turno do agente, sem precisar de feedback humano no meio.
-->

# Actions: <NOME DA FEATURE>

> Identificador: `<NNN>-<short-name>`
> Data: `YYYY-MM-DD`
> Roadmap: `<feature-dir>/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | <NN> |
| Paralelizáveis (`[//]`) | <NN> |
| Maior cadeia de dependência | <NN> |

## Fase 1, Preparação

<!-- Setup, scaffolding, migrações iniciais, configuração de infraestrutura local. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | <ação atômica> | - | `[//]` | `<caminho>` | 🟢 | `[ ]` |
| T002 | <ação atômica> | - | `[//]` | `<caminho>` | 🟢 | `[ ]` |
| T003 | <ação atômica> | T001 | - | `<caminho>` | 🟡 | `[ ]` |

## Fase 2, Testes

<!-- Testes que precisam existir antes ou logo após o núcleo. Omitir se a equipe não pratica TDD. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | <ação atômica> | T001 | `[//]` | `<caminho>` | 🟢 | `[ ]` |

## Fase 3, Núcleo

<!-- Lógica central da feature. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | <ação atômica> | T003 | - | `<caminho>` | 🟢 | `[ ]` |
| T006 | <ação atômica> | T005 | - | `<caminho>` | 🟢 | `[ ]` |

## Fase 4, Integração

<!-- Cola com outras partes do sistema, contratos externos, ganchos. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | <ação atômica> | T006 | - | `<caminho>` | 🟡 | `[ ]` |

## Fase 5, Polimento

<!-- Logs, telemetria, mensagens de erro, documentação curta. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | <ação atômica> | T007 | `[//]` | `<caminho>` | 🟢 | `[ ]` |
| T009 | <ação atômica> | - | `[//]` | `<caminho>` | 🟢 | `[ ]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgiram durante a execução.
Não use isso para corrigir ações, edits manuais ficam fora desse arquivo, vão direto no código.
-->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| YYYY-MM-DD | Versão inicial gerada por `/reversa-to-do` | reversa |
