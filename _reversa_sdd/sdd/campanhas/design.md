# Campanhas (Campaigns), Design Técnico

## Interface

Para endpoints HTTP:

| Método | Caminho | Entrada | Saída | Status codes |
|--------|---------|---------|-------|--------------|
| GET | `/campaigns` | `QueryParams` | `[Campaign]` | 200, 401 |
| POST | `/campaigns` | `FormData (Campaign properties + media)` | `Campaign` | 201, 400 |
| PUT | `/campaigns/:id` | `FormData` | `Campaign` | 200, 404 |
| POST | `/campaigns/:id/start` | `id` | `200 OK` | 200, 400 |
| POST | `/campaigns/:id/cancel` | `id` | `200 OK` | 200, 400 |

## Fluxo Principal
1. **Criação da Campanha:** O Controller de Campaign processa via Multer eventuais arquivos estáticos. Salva no disco (pasta `/public`). Grava no DB a referência.
2. **Ativação:** A rota `/start` altera o status de "PROGRAMADA" para o engine enxergar. Dispara `StartCampaignService`.
3. **Agendamento Bull:** O serviço joga o Payload no Job do Bull com a opção `delay` baseada no `scheduledAt` subtraindo `new Date()`.
4. **Worker Execution:**
   - O worker retira o job da fila.
   - Puxa todos os itens em `ContactListItem` vinculados à lista desta Campanha.
   - Realiza um laço (`for...of` com await) gerando jobs secundários na fila de "SendMessage" para cada número, introduzindo o *Random Delay* da `CampaignSetting` entre eles.
   - Preenche previamente `CampaignShipping` como `pending`.
   - Conforme as mensagens são despachadas via WWebJS, as promessas resolvem e o `CampaignShipping` é atualizado para `delivered` ou `error`.

## Fluxos Alternativos
- **Cancelamento:** Se `/cancel` for chamado antes do disparo, o sistema altera o status no banco e remove o job agendado da fila do Redis (`job.remove()`), impedindo o loop de começar.
- **Injeção de Variáveis:** O texto rotacionado passa pela library `pupa` (mesma dos Tickets) para injetar nome (`{name}`) e outras custom infos do Contato Alvo antes do disparo final.

## Dependências
- `BullMQ / Bull`: Gestão das filas em Redis.
- `Multer`: Middleware de File Upload nativo do Express.
- `pupa`: Templating.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Arquitetura de Background Jobs | Dependência nativa do Redis e bibliotecas de fila para blindar a API | 🟢 |
| Spintax Manual (Mensagens 1 a 3) | Colunas estáticas para rotacionar o conteúdo em vez de Regex Spintax nativa | 🟢 |

## Estado Interno
- **Progresso:** Controlado de forma agregada contando os `CampaignShipping`. Não é muito real-time nativamente se o volume for altíssimo (50k msgs), exige refresh ou contagens via socket batch.

## Observabilidade
- Emissão de sockets fragmentados informando alteração de status da Campanha (`[tenantId]:campaign`).

## Riscos e Lacunas
- 🟡 Qual a tolerância a falhas se o Worker do Node cair no meio do loop `for...of`? Em sistemas avançados, deve-se gerar 1 Job para CADA contato (Fan-out), mas se o legado gera 1 Job para a Campanha inteira e itera nela com `for...await...delay`, a quebra do processo pode perder a rastreabilidade do ponto de pausa.
