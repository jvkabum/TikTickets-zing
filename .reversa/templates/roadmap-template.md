<!--
Template de corpo do roadmap.md
Carregado por /reversa-plan.

REGRAS DE PREENCHIMENTO:
- Escreva como DELTA sobre o legado, jamais redescreva a arquitetura inteira.
- Cite componentes do _reversa_sdd/ por nome literal.
- Marque cada decisão com 🟢 / 🟡 / 🔴 conforme a confidência da fonte que a sustenta.
- Decisões dependentes de [DÚVIDA] aceitas como premissa entram com 🟡 e aparecem em "Premissas".
- Detalhes profundos de modelo de dados vão para data-delta.md, não aqui.
- Detalhes profundos de contrato externo vão para interfaces/<nome>.md, não aqui.
-->

# Roadmap: <NOME DA FEATURE>

> Identificador: `<NNN>-<short-name>`
> Data: `YYYY-MM-DD`
> Requirements: `<feature-dir>/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

<!-- Até dez linhas. Em prosa, explique o caminho técnico escolhido. -->

## 2. Princípios aplicados

<!--
Liste os princípios de `.reversa/principles.md` que essa feature respeita ou conflita.
Para conflitos, descreva o conflito sem propor mudança no princípio (isso é trabalho de /reversa-principles).
-->

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. <título> | <observação> | respeita / conflita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | <decisão> | <razão objetiva> | <a, b, c> | 🟢 |
| D-02 | <decisão> | <razão objetiva> | <a, b> | 🟡 |

## 4. Premissas

<!--
Premissas adotadas a partir de [DÚVIDA] não resolvidas.
Cada premissa precisa virar item resolvível em /reversa-clarify no futuro.
-->

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| <texto>  | <seção> | <impacto> |

## 5. Delta arquitetural

<!--
Liste apenas os componentes do `_reversa_sdd/architecture.md` que mudam.
Para cada um, descreva o tipo de mudança em uma linha.
-->

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| <nome> | `_reversa_sdd/architecture.md#<id>` | regra-alterada / componente-novo / componente-extinto / contrato-novo / contrato-alterado / contrato-removido | <uma linha> |

## 6. Delta no modelo de dados

<!-- Resumo. O detalhe (campos, migrações, índices) vive em data-delta.md. -->

- Resumo das mudanças: <prosa curta>
- Detalhe completo em: `<feature-dir>/data-delta.md`

## 7. Delta de contratos externos

<!-- Resumo. Cada contrato afetado tem um arquivo próprio em interfaces/. -->

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| <nome>   | HTTP / fila / gRPC / GraphQL / arquivo | `<feature-dir>/interfaces/<nome>.md` |

## 8. Plano de migração

<!-- Quando aplicável. Se a mudança não exige migração, registre "n/a" e siga. -->

1. <passo>
2. <passo>
3. <passo>

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| <risco> | alto / médio / baixo | alto / médio / baixo | <ação> |

## 10. Critério de pronto

<!-- O que precisa estar verdadeiro para a feature ser considerada concluída. -->

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| YYYY-MM-DD | Versão inicial gerada por `/reversa-plan` | reversa |
