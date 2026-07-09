<!--
Template de corpo do requirements-audit.md
Carregado por /reversa-quality.

REGRAS DE PREENCHIMENTO:
- Total entre dez e trinta itens. Menos é raso, mais é ruído.
- Cada item tem ID Q-NNN estável dentro deste relatório.
- Categorias permitidas: Clareza, Completude, Consistência, Cobertura, EdgeCases, Jargão, SoluçãoImplícita, Princípios.
- Itens reprovados ganham linha extra "> motivo: ..." e, quando cabível, "> sugestão: ...".
- ESTE COMANDO AVALIA QUALIDADE DE ESCRITA. Não inclua itens de teste de implementação ("verificar se o botão funciona" etc.).
-->

# Requirements Audit

> Identificador da feature: `<NNN>-<short-name>`
> Data: `YYYY-MM-DD`
> Documento auditado: `<feature-dir>/requirements.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de itens | <NN> |
| Aprovados | <NN> |
| Reprovados | <NN> |
| Veredito | Aprovado / Aprovado com ressalvas / Reprovado |

## Itens por categoria

### Clareza

- [ ] Q-001 | Clareza | Cada frase do requirements tem sujeito, verbo e objeto explícitos
- [ ] Q-002 | Clareza | Não há frases iniciadas por "talvez", "provavelmente" ou "se possível" sem qualificação numérica
- [ ] Q-003 | Clareza | Termos do glossário do projeto são definidos na primeira ocorrência

### Completude

- [ ] Q-004 | Completude | Todas as seções obrigatórias do template estão preenchidas com conteúdo, não placeholders
- [ ] Q-005 | Completude | Cada Requisito Funcional tem critério de aceite verificável
- [ ] Q-006 | Completude | Existem cenários Gherkin para casos felizes E casos negativos

### Consistência

- [ ] Q-007 | Consistência | Termos chave do domínio aparecem com a mesma grafia em todas as seções
- [ ] Q-008 | Consistência | IDs citados em uma seção existem na seção que os define
- [ ] Q-009 | Consistência | Confidência (🟢 / 🟡 / 🔴) coerente com a fonte citada do `_reversa_sdd/`

### Cobertura

- [ ] Q-010 | Cobertura | Todo Requisito Funcional tem pelo menos um cenário Gherkin
- [ ] Q-011 | Cobertura | Toda Regra de Negócio nova ou alterada cita a regra original do `_reversa_sdd/domain.md` quando aplicável

### EdgeCases

- [ ] Q-012 | EdgeCases | Limites numéricos relevantes têm valor concreto (não "muitos", "poucos")
- [ ] Q-013 | EdgeCases | Estados vazios, nulos e iniciais foram considerados
- [ ] Q-014 | EdgeCases | Concorrência, retentativa e timeout foram considerados quando aplicáveis

### Jargão

- [ ] Q-015 | Jargão | Um humano novo no time entenderia o requirements sem glossário
- [ ] Q-016 | Jargão | Siglas são expandidas na primeira ocorrência

### SoluçãoImplícita

- [ ] Q-017 | SoluçãoImplícita | O requirements descreve o quê, não o como
- [ ] Q-018 | SoluçãoImplícita | Não há nome de biblioteca, framework ou produto comercial no documento

### Princípios

- [ ] Q-019 | Princípios | Cada Regra de Negócio respeita os princípios ativos em `.reversa/principles.md`
- [ ] Q-020 | Princípios | Conflitos com princípios estão registrados explicitamente, não escondidos

## Itens reprovados, detalhe

<!--
Para cada item marcado [ ] após avaliação, repita o ID e adicione motivo + sugestão.
Para itens [X] não escreva nada aqui.
-->

### Q-NNN

> motivo: <razão objetiva, uma a duas frases>
> sugestão: <texto curto que o autor poderia aplicar>

## Veredito

<!--
Escolha UM dos três:
- Aprovado: zero reprovações.
- Aprovado com ressalvas: até três reprovações, nenhuma CRITICAL.
- Reprovado: mais de três reprovações OU pelo menos uma CRITICAL.

Itens CRITICAL: cobertura ausente, princípio violado, contradição interna entre seções.
-->

**Aprovado / Aprovado com ressalvas / Reprovado**

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| YYYY-MM-DD | Auditoria gerada por `/reversa-quality` | reversa |
