# Habilidade: Mensagens de Commit (Commit Message)

Esta habilidade orienta a IA e os desenvolvedores na geração de mensagens de commit padronizadas, garantindo um histórico de projeto limpo e legível.

## Padrão: Conventional Commits
As mensagens devem seguir o formato: `<tipo>(escopo): <descrição curta>`

- `feat`: Adição de nova funcionalidade (ex: novo canal de atendimento).
- `fix`: Correção de um bug (ex: erro de conexão no WhatsApp).
- `docs`: Alterações apenas na documentação.
- `style`: Alterações que não afetam o sentido do código (espaços em branco, formatação, etc).
- `refactor`: Mudança no código que não corrige um bug nem adiciona uma funcionalidade.
- `perf`: Mudança de código que melhora o desempenho (ex: otimização de polling).
- `test`: Adição de testes ausentes ou correção de testes existentes.
- `chore`: Alterações no processo de build ou ferramentas auxiliares e bibliotecas.

## Convenções de Branch
- `feature/nome-da-feature`: Para novos desenvolvimentos.
- `hotfix/nome-do-erro`: Para correções críticas em produção.
- `refactor/nome-da-melhoria`: Para refatorações estruturais.

## Exemplos de Mensagens no TikTickets
- `perf(whatsapp): reduzido polling para 2s para acelerar estabilização do QR`
- `fix(backend): adicionada retentativa no SessionCleanupService para evitar EBUSY`
- `feat(frontend-vue-3): implementada visualização dinâmica de mensagens de mídia`
- `chore(context): inicializada estrutura PREVC para gestão de IA no projeto`

## Diretrizes Adicionais
1. **Idioma**: Sempre em Português do Brasil.
2. **Imperativo**: Use o tempo verbal imperativo ou presente (ex: "adiciona" ou "adicionado").
3. **Escopo**: Sempre identifique o módulo afetado entre parênteses.
