# Auto-respostas, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD de Auto-Respostas e Keywords
  - Origem no legado: `AutoReplyController.ts`
  - Critério de pronto: Salvar frase-alvo (KeyWord), Ação Desejada e Texto de Despacho atrelado ao Tenant.
  - Confiança: 🟢

- [ ] T-02, Interceptador e Processador
  - Origem no legado: Interceptador Message (Eventos / Hooks).
  - Critério de pronto: Se ticket for pending, tentar dar match string-includes na mensagem nova do cliente contra o banco de AutoReplies. Se bater e ação for 0, invocar `SendMessageProxy`.
  - Confiança: 🟢
