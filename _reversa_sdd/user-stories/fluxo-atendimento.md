# Fluxo de Atendimento (Story Mapping)

Este documento traça o ciclo de vida ponta a ponta do objeto central do sistema: o **Ticket** (Atendimento).

## Fase 1: Entrada do Cliente (Inbound)
1. **O Gatilho:** O cliente envia uma mensagem de WhatsApp para o número cadastrado no módulo `Canais`.
2. **Identificação:** O `MessageListener` intercepta o evento. Verifica se o `Contact` já existe; se não, cria.
3. **Criação do Ticket:** Se o cliente não possuir um Ticket `open` ou `pending`, um novo Ticket é gerado com status `pending`.
4. **Acionamento do Bot:** Se o Canal possuir um `ChatFlow` configurado, o sistema congela a notificação humana e apresenta o menu lógico ao cliente (URA Digital).
5. **Transbordo:** O cliente interage com o bot e cai em um nó de Ação "Queue_Transfer" para a Fila de "Suporte Técnico".

## Fase 2: Triagem e Espera
1. **Fila de Espera:** O Ticket altera sua `queueId` para a fila correspondente e dispara o evento via Socket `[tenantId]:ticket`.
2. **Dashboard de Operadores:** Operadores que pertencem à fila de Suporte Técnico recebem um alerta sonoro e visual no Frontend (painel de "Aguardando"). O TME (Tempo de Espera) começa a correr do lado do SLA.

## Fase 3: Atendimento Ativo
1. **Aceite:** O Operador "Maria" clica em "Aceitar".
2. **Vinculação:** O sistema atualiza o status do Ticket para `open` e atrela o `userId` de Maria ao ticket.
3. **Respostas Rápidas:** Maria usa `/bomdia` que expande para a saudação corporativa.
4. **Troca de Mensagens:** A conversa ocorre via websockets no frontend, refletindo no aparelho celular em tempo real através do Baileys/Puppeteer.
5. **LogTicket:** Toda mudança de status ou de fila fica registrada na tabela de auditoria.

## Fase 4: Fechamento
1. **Resolução:** Maria conclui a dúvida e clica em "Resolver".
2. **Alteração de Status:** O ticket vai para `closed`.
3. **NPS / CSAT:** Se a configuração `userRating` estiver habilitada (via `Settings`), o bot toma as rédeas e dispara a mensagem de avaliação ("De 1 a 3, como foi seu atendimento?").
4. **Estatísticas:** O tempo total é fechado e computado no TMA (Tempo Médio de Atendimento) para Maria. A nota da pesquisa de satisfação retroalimenta o Dashboard (`Estatísticas`).
