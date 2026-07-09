# Fluxo de Chat (Chatflow), Tarefas de Implementação

> Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Pré-requisitos
- [ ] Entidade `Tenant` operando.
- [ ] Listener base do WhatsApp (`wbotMessageListener`) pronto para injeção do middleware de bot.

## Tarefas

- [ ] T-01, Implementar Entidade `ChatFlow`
  - Origem no legado: `backend/src/models/ChatFlow.ts`
  - Critério de pronto: Tabela criada com `name`, `flow` (JSONB), `isActive` (boolean), `celularTeste` (string) e relacionamentos com `Tenant`.
  - Confiança: 🟢

- [ ] T-02, Serviços de CRUD (`CreateChatFlowService`, `UpdateChatFlowService`, etc)
  - Origem no legado: `backend/src/services/ChatFlowServices/...`
  - Critério de pronto: Lógica de banco permitindo salvar e editar o JSON da árvore, restrito por `tenantId`.
  - Confiança: 🟢

- [ ] T-03, Validador de Estrutura do Fluxo
  - Origem no legado: Controller / Helpers
  - Critério de pronto: Middleware que verifica se a estrutura de `nodes` e `edges` enviada pelo Front-end não está quebrada antes de tentar salvar.
  - Confiança: 🟡

- [ ] T-04, Exposição REST API
  - Origem no legado: `backend/src/controllers/ChatFlowController.ts`
  - Critério de pronto: Rotas GET, POST, PUT, DELETE protegidas e com emissão do evento socket `[tenantId]:chatflow`.
  - Confiança: 🟢

- [ ] T-05, Engine de Execução do Bot (Runtime)
  - Origem no legado: Arquivos injetados dentro de `services/WbotServices/wbotMessageListener.ts`
  - Critério de pronto: Construir o interpretador de `nodes`. Se for mensagem, responde. Se for menu, aguarda 1/2/3. Se for transfer, muda o `queueId` do Ticket. Lida corretamente com a flag `celularTeste`.
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Enviar um JSON inválido/malformado no PUT. A API não deve salvar, protegendo o loop de mensagens.
- [ ] TT-02, Teste Unitário do Motor do Bot: Dado um node de menu com 2 ramificações e input do usuário "1", verificar se a função retorna o Target Node ID correto.

## Ordem Sugerida
1. T-01: Base.
2. T-02 e T-03: Manipulação segura dos dados que o Front-end vai salvar.
3. T-04: Conectar Frontend ao BD.
4. T-05: Essa é a tarefa mais densa e complexa do módulo e deve ser feita após a consolidação das filas (Queue) e Tickets.

## Lacunas Pendentes (🔴)
Nenhuma lacuna crítica pendente. A complexidade deste módulo está 90% contida na T-05 (Runtime do Bot).
