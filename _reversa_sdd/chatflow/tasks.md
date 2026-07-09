# ChatFlow, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Interceptador e Processamento Vetorial
  - Origem no legado: `backend/src/services/ChatFlowServices/VerifyStepsChatFlowTicket.ts`
  - Critério de pronto: Implementar o Helper que recebe a Thread do Ticket e lê as subpropriedades `nodeList` e `lineList` do JSON no BD, deduzindo a próxima ação lógica.
  - Confiança: 🟢

- [ ] T-02, Controle de Timeout de Erros (Retentativas)
  - Origem no legado: Variável `botRetries` do Ticket vs Variável do Tenant.
  - Critério de pronto: Incrementar erro. Ao exceder limite, chutar contato compulsoriamente pra um humano (Transferência).
  - Confiança: 🟢

- [ ] T-03, Model Getters para Anexos Mídia
  - Origem no legado: `backend/src/models/ChatFlow.ts`
  - Critério de pronto: Implementar getter nativo na coluna JSON que inspeciona o objeto e, caso um nó seja `MediaField`, force a prepend do `BACKEND_URL` à propriedade.
  - Confiança: 🟢
