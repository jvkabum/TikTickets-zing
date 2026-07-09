# Canais, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Gestor CRUD e Token JWT de Hooks
  - Origem no legado: `backend/src/models/Whatsapp.ts` e Controllers.
  - Critério de pronto: Cadastrar conexões assinando as entradas do tipo "WABA" e "Messenger" com os referidos JWTs para preenchimento de URLs visíveis.
  - Confiança: 🟢

- [ ] T-02, Controle de Cotas
  - Origem no legado: `backend/src/controllers/WhatsAppController.ts` (store)
  - Critério de pronto: Limitação forte contra `Tenant.maxConnections` e `.env.CONNECTIONS_LIMIT`.
  - Confiança: 🟢

- [ ] T-03, Remoção Consciente de Processos (Destruição em Memória)
  - Origem no legado: `backend/src/controllers/WhatsAppController.ts` (remove)
  - Critério de pronto: Antes de apagar no DB, instanciar a limpeza da biblioteca WhatsApp-Web.js correspondente.
  - Confiança: 🟢
