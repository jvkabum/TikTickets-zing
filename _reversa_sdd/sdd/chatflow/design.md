# Fluxo de Chat (Chatflow), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/chatflows` | `QueryParams` | `[ChatFlow]` | 200, 401 |
| GET | `/chatflows/:id` | `id` | `ChatFlow` | 200, 404, 401 |
| POST | `/chatflows` | `{ name, flow, isActive, celularTeste }` | `ChatFlow` | 200, 400, 401 |
| PUT | `/chatflows/:id` | `{ name, flow, isActive, celularTeste }` | `ChatFlow` | 200, 400, 404 |
| DELETE | `/chatflows/:id` | `id` | `200 OK` | 200, 404, 401 |

## Fluxo Principal
1. **Criação/Desenho:** O UI (ReactFlow / VueFlow) serializa os blocos da tela em um JSON `{ nodes: [], edges: [] }`. Esse payload é recebido na prop `flow` e gravado diretamente no Postgres (JSONB).
2. **Execução de Rotina (Bot Builder Runtime):**
   - Quando um webhook do Baileys recebe mensagem de um Contato.
   - O `VerifyChatFlow` service (dentro do messageListener) verifica se o Ticket não está com humano.
   - Busca o `ChatFlow` ativo atrelado ao Whatsapp receptor.
   - Analisa o nó atual onde o Contato parou (registrado em cache ou ticket).
   - Resolve o próximo nó buscando o `edge` correspondente ao input digitado.
   - Executa a ação do nó alvo.

## Fluxos Alternativos
- **Nó de Transbordo (Queue/User):** Ao atingir um nó com a diretiva de transferência, o engine altera o status do Ticket para `pending` com `queueId` específico, envia socket notification pro frontend e quebra o loop de verificação do Chatflow, libertando o Contato para o humano.

## Dependências
- `PostgreSQL (JSONB)`: Fundacional para salvar esquemas livres de nós e conexões sem criar um schema relacional infernal.
- `Redis` (Opcional, Comum no Legado): Muito usado para guardar a sessão do usuário (em que nó ele está agora) para não bater no DB a cada nova mensagem.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Arquitetura Event-driven do Runtime | Integrado dentro do `wbotMessageListener` | 🟢 |
| Tipagem flexível da árvore | Model `ChatFlow` usando JSON/JSONB | 🟢 |

## Estado Interno
- **Position Tracking:** O bot precisa lembrar onde o cliente parou (em que Node ID ele se encontra). O legado normalmente anexa isso na tabela `Ticket` ou `Contact` como `currentChatFlowId` e `stepChatFlow`.

## Observabilidade
- Emissão de sockets fragmentados: `[tenantId]:chatflow` para manter o painel de admins atualizado quando alguém altera as automações.

## Riscos e Lacunas
- 🟡 A validação estrutural do JSON é fraca (apenas validação base do Controller). Se um payload JSON corrompido for injetado, o `wbotMessageListener` pode explodir com TypeError durante o parsing, derrubando toda a fila de processamento do WhatsApp daquele Tenant. Sugerido adicionar schema validation rigoroso (Yup/Zod) antes de salvar o `flow`.
