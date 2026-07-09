# Mensagens, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD Infinite Scroll de Leituras
  - Origem no legado: `backend/src/controllers/MessageController.ts` (index)
  - Critério de pronto: Listagem decrescente das conversas baseadas no `ticketId` e extraindo a URL final do `mediaUrl` virtualmente.
  - Confiança: 🟢

- [ ] T-02, Multipart Send (Texto + Upload)
  - Origem no legado: `backend/src/controllers/MessageController.ts` (store)
  - Critério de pronto: Engolir o arquivo em `diskStorage`, registrar no banco como `fromMe: true` e atirar o comando pro Proxy Wrapper.
  - Confiança: 🟢

- [ ] T-03, Wrapper Polimórfico de Despacho (Proxy)
  - Origem no legado: `SendMessageSystemProxy.ts`
  - Critério de pronto: Classe com pattern Factory/Proxy que avalie se o Ticket alvo pertence a WABA, Baileys ou Telegram, invocando a biblioteca certa de I/O em tela limpa.
  - Confiança: 🟢
