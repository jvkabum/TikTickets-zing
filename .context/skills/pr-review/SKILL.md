---
type: skill
name: Revisão de PR (PR Review)
description: Padrão de revisão de Pull Requests contra padrões do TikTickets-zing
skillSlug: pr-review
phases: [R, V]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# 🚩 Revisão de PR (PR Review)

Esta skill define como as revisões de código devem ser conduzidas para garantir que apenas código de alta qualidade chegue à `main`.

## 👓 Critérios de Aceitação

### 1. Conformidade Técnica
- [ ] O código segue as diretrizes do **Backend/Frontend Specialist**?
- [ ] Novos arquivos têm extensões `.ts` ou `.vue` (com TypeScript habilitado)?
- [ ] Há uso de nomes de variáveis semânticos e em português/inglês consistente com o projeto?

### 2. Estabilidade e Performance
- [ ] Há potencial de memory leak (ex: loops infinitos em useEffect/watch)?
- [ ] O tratamento de erros é robusto e não mata o processo (`try/catch` adequados)?
- [ ] Queries de banco estão otimizadas e usam índices?

### 3. Cultura e Documentação
- [ ] O commit segue o padrão da `commit-message/SKILL.md`?
- [ ] Mudanças em APIs foram refletidas na documentação técnica?

## 💬 Estilo de Comunicação
- Seja **construtivo**: Sira sugestões em vez de apenas apontar erros.
- Use **prioridades**:
    - 🔴 **Bloqueante**: Bug crítico, falha de segurança ou quebra de padrão core.
    - 🟡 **Sugestão**: Melhora de legibilidade ou micro-otimização.
    - 🟢 **Elogio**: Reconhecer código bem escrito ou soluções inteligentes.

## ✅ Portão de Aprovação
Um PR só pode ser aprovado se:
1. Passar no Lint sem avisos.
2. Todos os testes afetados estiverem passando.
3. Não introduzir "code smells" evidentes.
