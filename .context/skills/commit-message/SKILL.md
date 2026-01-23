---
type: skill
name: Mensagens de Commit (Commit Message)
description: Padrão sênior para mensagens de commit detalhadas e rastreáveis
skillSlug: commit-message
phases: [C]
generated: 2026-01-23
status: filled
scaffoldVersion: "2.0.0"
---

# ✍️ Mensagens de Commit (Commit Message)

Esta skill garante que o histórico do Git seja uma ferramenta de documentação valiosa para o projeto. Proibimos mensagens genéricas e exigimos contexto técnico detalhado.

## 🚫 PROIBIÇÕES (Anti-Patterns)
- **NUNCA** use mensagens automáticas de plano/fase: `chore(plan): complete phase`, `feat: update files`.
- **NUNCA** use descrições vagas: `fix: bugs`, `refactor: code`, `update: wbot`.
- **NUNCA** commite sem explicar o **PORQUÊ** da mudança se ela for lógica.

## 📏 Padrão Conventional Commits Estendido

Estrutura exigida: `<tipo>(<escopo>): <descrição técnica concisa>`

### 1. Tipos Permitidos:
- `feat`: Nova funcionalidade.
- `fix`: Correção de bug.
- `refactor`: Mudança de código que não altera funcionalidade nem corrige bug.
- `docs`: Mudanças na documentação.
- `perf`: Melhoria de performance.
- `chore`: Manutenção, configs, build.
- `test`: Adição ou correção de testes.

### 2. Escopo:
Onde a mudança ocorreu? (ex: `wbot`, `frontend`, `api`, `socket`, `context`).

### 3. Body Detalhado (Obrigatório para Lógica/Fix/Feat)
O corpo da mensagem é obrigatório se a alteração for técnica ou arquitetural. 
- Use bullet points (`-`).
- Explique **O QUE** mudou, **POR QUE** mudou e o **IMPACTO** (riscos ou quebras).

## 📑 Exemplos de Excelência (Sênior) ✅

```markdown
fix(wbot): implementa watchdog híbrido para destravar sessões zumbis

- Adiciona timer de 15s no 'initWbot' para detectar falha no evento 'ready'.
- Integra validação via 'verifyRealConnection' (foto de perfil/status).
- Substitui lógica de 'forceReconnect' por estratégia progressiva (leve->média->pesada).
- Corrige bug em enquetes (vote.getMessage) mantendo ID seguro msg.id.id.

Por que: O Puppeteer disparava eventos de autenticação antes de popular o objeto info,
causando quedas intermitentes no processo de inicialização de novas sessões.
```

## 🌍 Diretrizes de Idioma
1. **Idioma**: Sempre em **Português do Brasil**.
2. **Modo Imperativo**: "Adiciona", "Corrige", "Remove" em vez de "Adicionado".
3. **Clareza**: Use termos técnicos em inglês se for padrão (Socket, Polling), mas a explicação em PT-BR.
