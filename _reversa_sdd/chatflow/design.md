# ChatFlow, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Fluxo Principal
1. Cliente do WhatsApp envia um "Oi".
2. O listener mestre enxerga que o Ticket ainda está sem Usuário Humano (`pending`).
3. Dispara-se o Serviço `VerifyStepsChatFlowTicket`.
4. O sistema consulta a entidade `ChatFlow` na memória (JSON column).
5. Varre a estrutura vetorial de ligações (`nodeList`, `lineList`). Executa Ações. Ação 0 é mandar a próxima mensagem textual/midia e parar. Ação 1 invoca transferência para Filas, Ação 2 para Operador Específico.
6. A Mensagem da engine é despachada utilizando o wrapper `SendMessageSystemProxy` preenchendo as tags do motor Pupa.

## Dependências
- **SendMessageSystemProxy**: O gerador de envio. O Bot não toca no pacote de conectividade, ele invoca esse intermediário.
- **Pupa**: Biblioteca interpoladora em Node para troca de marcadores textuais.

## Estado Interno
As entidades ChatFlow funcionam como um grande objeto JSON serializado guardando nós vetoriais e ligações da interface do desenhador visual (ReactFlow/VueFlow provável no Frontend).

## Riscos e Lacunas
- 🔴 O schema JSON interno (`nodeList`, `lineList`) e como o Frontend o constrói demandam cautela pesada, uma alteração de layout destrói o bot.
