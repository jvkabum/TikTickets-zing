---
name: Mensagens de Commit (Commit Message)
description: Padrão sênior para mensagens de commit detalhadas e rastreáveis
phases: [C]
---

# ✍️ Mensagens de Commit (Commit Message)

Esta skill garante que o histórico do Git seja uma ferramenta de documentação valiosa para o projeto. Proibimos mensagens genéricas.

## 📏 Padrão Conventional Commits

Estrutura exigida: `tipo(escopo): assunto descritivo`

### Tipos Permitidos:
- `feat`: Nova funcionalidade.
- `fix`: Correção de bug.
- `refactor`: Mudança de código que não altera funcionalidade nem corrige bug.
- `docs`: Mudanças na documentação.
- `perf`: Melhoria de performance.
- `chore`: Mudanças em ferramentas de build ou bibliotecas.

## 📝 Regras de Ouro (Proibido Mensagens Curtas)
1. **Nunca** use mensagens como "update code", "fix bug" ou "chore(plan): complete phase".
2. **Body Detalhado**: O corpo da mensagem é obrigatório se a alteração for técnica ou arquitetural.
    - Use bullet points (`-`).
    - Explique **O QUE** mudou, **POR QUE** mudou e **COMO** foi implementado.
3. **Idioma**: Português do Brasil.
4. **Modo Imperativo**: "Adiciona filtro..." em vez de "Adicionado filtro...".

## 📑 Exemplo Sênior
```markdown
fix(wbot): evita TypeError ao acessar wbot.info durante boot

- Adiciona optional chaining em todos os acessos ao objeto wbot.info.
- Implementa verificação de wid antes de chamar getProfilePicUrl no Watchdog.
- Garante fallback para o número do WhatsApp salvo no banco se a sessão estiver instável.
- Corrige tipagem da interface Session para suportar metadados do wwebjs.

Por que: O Puppeteer disparava eventos de autenticação antes de popular o objeto info,
causando quedas intermitentes no processo de inicialização de novas sessões.
```