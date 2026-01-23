---
name: Revisão de Código (Code Review)
description: Padrões de revisão técnica e qualidade de código para o TikTickets-zing
phases: [R, V]
---

# 🔍 Revisão de Código (Code Review)

Esta skill é a guardiã da qualidade técnica do projeto, focando em padrões sêniores de implementação e manutenção.

## 🕵️ Foco da Revisão

### 1. Robustez em TypeScript
- [ ] Garantir que não existam tipos `any` injustificados.
- [ ] Verificar se as interfaces estão bem definidas e centralizadas em arquivos de tipos.
- [ ] Validar se o optional chaining foi usado corretamente onde há risco de nulidade (ex: `wbot.info`).

### 2. Padrões Arquiteturais
- [ ] O código respeita a separação de responsabilidades (Controller -> Service -> Lib)?
- [ ] Há redundância de código que poderia ser centralizada em um Helper?
- [ ] As variáveis seguem o padrão camelCase e são semânticas?

### 3. Gerenciamento de Recursos
- [ ] Loops de eventos e intervalos são limpos adequadamente (`clearInterval`)?
- [ ] Promessas são tratadas com `try/catch` de forma granular?
- [ ] Conexões de banco e WhatsApp são gerenciadas eficientemente para evitar vazamentos?

## 📝 Procedimento de Revisão
- **Análise Estática**: Verificar erros de lint e formatação.
- **Análise Lógica**: Entender o fluxo do dado e identificar possíveis "edge cases".
- **Feedback**: Fornecer sugestões de melhoria com exemplos de código quando aplicável.

## 💡 Mantra do Revisor
"Não revisamos apenas para encontrar erros, revisamos para ensinar e aprender. O código é do time, não do autor."