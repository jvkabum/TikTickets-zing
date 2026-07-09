<!--
Template de corpo do requirements.md
Carregado por /reversa-requirements e atualizado por /reversa-clarify.

REGRAS DE PREENCHIMENTO:
- Mantenha a ordem das seções obrigatórias.
- Não apague seções marcadas como obrigatórias, mesmo quando vazias (use "n/a" se necessário).
- Comentários inline (entre <!-- -->) só devem ser removidos quando a seção correspondente estiver totalmente preenchida.
- Use 🟢 / 🟡 / 🔴 conforme a confidência da fonte do _reversa_sdd/ que sustenta a afirmação.
- Marque com [DÚVIDA] qualquer ponto onde a informação faltar; máximo de três marcadores no documento inicial.
-->

# Requirements: <NOME DA FEATURE>

> Identificador: `<NNN>-<short-name>`
> Data: `YYYY-MM-DD`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

<!--
Até cinco linhas. Diga o quê a feature entrega, para quem, e qual problema do legado ela resolve.
NÃO descreva como será implementada.
-->

## 2. Contexto a partir do legado

<!--
Liste os artefatos da pipeline reversa que sustentam essa feature.
Cada citação no formato _reversa_sdd/<arquivo>#<seção>.
Use confidência herdada da fonte original.
-->

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#<seção>` | <resumo> | 🟢 |
| `_reversa_sdd/domain.md#<seção>` | <resumo> | 🟢 |
| `_reversa_sdd/code-analysis.md#<componente>` | <resumo> | 🟡 |

## 3. Personas e cenários de uso

<!-- Quem usa, com qual objetivo, em qual frequência. -->

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| <persona> | <objetivo> | <descrição em uma frase> |

## 4. Regras de negócio novas ou alteradas

<!--
Cada regra como item numerado. Para regras que ALTERAM regra confirmada do legado,
referencie a regra original via `_reversa_sdd/domain.md#<id>`.
Marque cada regra com 🟢 / 🟡 / 🔴.
-->

1. **RN-01:** <descrição> 🟢
   - Origem no legado: `_reversa_sdd/domain.md#<id>` (se aplicável)
   - Tipo: nova | alterada | removida
2. **RN-02:** ...

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | <descrição> | Must | <critério verificável> | 🟢 |
| RF-02 | <descrição> | Should | <critério verificável> | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | <requisito> | <fonte ou rationale> | 🟢 |
| Segurança | <requisito> | <fonte ou rationale> | 🟡 |
| Observabilidade | <requisito> | <fonte ou rationale> | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: <título>
  Dado <pré-condição>
  Quando <ação do ator>
  Então <resultado observável>

Cenário: <título do caso negativo>
  Dado <pré-condição>
  Quando <ação inválida>
  Então <comportamento esperado de falha>
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | <razão> |
| RF-02 | Should | <razão> |
| RNF de desempenho | Should | <razão> |

## 9. Esclarecimentos

<!--
Esta seção é preenchida APENAS por /reversa-clarify.
Antes da primeira sessão de dúvidas, mantenha a seção com o aviso abaixo.
-->

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

<!--
Liste pontos sem resposta. Lacunas resolvidas pelo /reversa-clarify saem daqui e ficam registradas no histórico.
-->

- 🔴 [DÚVIDA] <ponto sem resposta>
- 🔴 [DÚVIDA] <ponto sem resposta>

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| YYYY-MM-DD | Versão inicial gerada por `/reversa-requirements` | reversa |
