# ChatFlow (Automação de Atendimento)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Motor de roteamento e triagem via árvore de opções (I.V.R. e Bot), processando a recepção dos tickets sem intervenção humana, oferecendo cardápios de escolha, e direcionando o cliente final à fila ou operador adequados.

## Responsabilidades
- Interceptar mensagens novas em tickets de status `pending`.
- Avaliar palavras-chave que podem encerrar imediatamente o atendimento.
- Transferir autonomamente tickets para os setores ou usuários designados.
- Controlar loops do cliente limitando retentativas para evitar bloqueio por bot-spam.

## Regras de Negócio
- A estrutura de passos funciona numa lógica vetorial codificada em banco 🟢
- O Modo Teste (campo `celularTeste`) previne que usuários reais disparem o construtor do bot durante manutenção 🟢
- Se a inteligência artificial não for compreendida pelo contato N vezes (Cota de Erros `maxRetryBotMessage`), o sistema ignora o bot e força um fallback manual ou um encerramento emergencial 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Engajamento Inicial (Interceptor) | Must | O interceptador valida se o Ticket "A" recém-criado deve responder baseando-se nas chaves da mensagem do Contato. |
| RF-02 | Transferência Automatizada | Must | Nós do tipo "Roteamento para Fila/Operador" devem fechar o fluxo bot e setar ativamente a Foreign Key do Ticket para a equipe humana. |
| RF-03 | Controle de Retentativas | Must | Bloquear o cliente de continuar conversando com a árvore após `N` falhas contabilizadas. |
| RF-04 | Gatilho de Fechamento por KeyWord | Should | Interromper todo atendimento ao se ler palavras como "Cancelar". |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Arquitetura | Banco NoSQL-like Embutido | JSON Schema serializando nodes e links complexos no campo genérico `flow` | 🟢 |
| Mídia Dinâmica | Getter Parse do BD | Model `ChatFlow` injeta raiz BACKEND_URL durante a serialização JSON para expor as imagens no FrontEnd | 🟢 |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/services/ChatFlowServices/VerifyStepsChatFlowTicket.ts` | Motor I.V.R / Interceptador | 🟢 |
| `backend/src/models/ChatFlow.ts` | Getters `flow` de Mídia | 🟢 |
