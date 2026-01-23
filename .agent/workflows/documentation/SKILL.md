---
name: Documentação Técnica (Documentation)
description: Diretrizes para geração e atualização de documentação no TikTickets-zing
phases: [P, C]
---

# 📖 Documentação Técnica (Documentation)

Esta skill garante que o conhecimento do projeto seja preservado e acessível, mantendo a documentação em sincronia com o código.

## 🏗️ Estrutura de Documentação

### 1. Documentação de Fluxo (Data Flow)
Sempre que uma nova integração for adicionada, atualizar o `data-flow.md` detalhando:
- Origem do dado.
- Transformações.
- Destino final (Banco ou UI).

### 2. Documentação de API (README/Swagger)
Documentar novos endpoints no README do backend ou em arquivos `.context/docs/api-reference.md`:
- Método (GET/POST/etc).
- Body esperado e parâmetros de query.
- Possíveis retornos de erro (4xx, 5xx).

### 3. Comentários no Código (JSDoc)
- Usar JSDoc para documentar funções complexas, detalhando parâmetros e tipos de retorno.
- Evitar comentários que apenas repetem o que o código faz; focar no **PORQUÊ** de decisões complexas.

## 📝 Checklists de Atualização
- [ ] **Sync**: A documentação no `.context/docs/` reflete o estado atual da `main`?
- [ ] **Acessibilidade**: Os diagramas (se houver) e textos são claros para novos desenvolvedores?
- [ ] **Playbooks**: As instruções dos agentes especialistas foram atualizadas com novas ferramentas ou padrões introduzidos?

## 🚀 Padrão de Escrita
- Linguagem: Português do Brasil.
- Tom: Técnico, objetivo e colaborativo.
- Formato: Markdown GFM.