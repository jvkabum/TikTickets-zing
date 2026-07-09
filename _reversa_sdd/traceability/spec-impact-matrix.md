# Matriz de Impacto de Especificações (Spec Impact Matrix)

Esta matriz mapeia como uma modificação em um módulo específico pode impactar outras partes do ecossistema do TikTickets-zing.

| Módulo Alterado | Impacta Diretamente | Componentes Acoplados a Revisar | Grau de Risco |
|-----------------|---------------------|---------------------------------|---------------|
| `auth` | Todo o ecossistema SaaS | `users`, Sessões JWT, Middlewares de Tenant | 🔴 CRÍTICO |
| `tenants` | Isolamento Multi-tenant | `auth`, validação de limites de usuários/conexões, `super-admin` | 🔴 CRÍTICO |
| `users` | Operação do Painel | `tickets`, `queues` (Associação), Presença Online (Sockets) | 🟡 ALTO |
| `tickets` | Núcleo Operacional | `messages`, `chatflow` (Roteamento), `statistics` (TMA/TME), `contacts` | 🔴 CRÍTICO |
| `contacts` | Agenda e Importações | `tickets`, `campaigns` (Envios em massa) | 🟡 ALTO |
| `queues` | Distribuição de Atendimentos | `users`, `tickets`, `chatflow` (Transferência do Bot) | 🟡 ALTO |
| `chatflow` | Automação e Bot | `whatsapp` (Canal de Entrada), `tickets` (Processamento Inicial), `messages` | 🔴 CRÍTICO |
| `channels (whatsapp)`| Conectividade Múltipla | `messages` (In/Outbound), Webhooks (`api-integration`), `chatflow` | 🔴 CRÍTICO |
| `campaigns` | Envios Massivos e Bull | Jobs do Redis, Controle de Bloqueios (Ban/SPAM), `contacts` | 🟡 ALTO |
| `fast-replies` | UI do Chat e Aceleração | Frontend UI, Disparo de mídias dinâmico no `messages` | 🟢 BAIXO |
| `settings` | Regras Globais do Tenant | **ATENÇÃO:** `tickets` (vazamento na query daysToClose), frontend stores | 🟡 ALTO |
| `statistics` | Relatórios de Desempenho | Componentes do Dashboard, Performance do Banco (Raw SQL) | 🟢 BAIXO |
| `api-integration`| Headless e Integrações | Middlewares `req.APIAuth`, Fila do `campaigns/messages` | 🟡 ALTO |
| `tags` | Organização de Interface | `tickets`, `contacts`, Filtros de Pesquisa Frontend | 🟢 BAIXO |
| `auto-replies` | Automação Básica I.V.R. | `tickets`, `messages` (Concorrente histórico ao `chatflow`) | 🟡 ALTO |
| `messages` | Transação Textual/Mídia | Quase todos. Motor final da ponte Banco-Redis-WhatsApp | 🔴 CRÍTICO |

### Considerações Práticas

1. **Alterações em `tickets` ou `messages`**: Como as métricas de tempo (TMA/TME) em `statistics` dependem de consultas cruas (Raw SQL) com hardcode do esquema e estados do `Ticket` e `LogTicket`, qualquer mudança de DDL ou status causará a quebra silenciosa dos Dashboards.
2. **Alterações em `channels` (WhatsApp)**: Dependências altamente acopladas à versão da biblioteca `whatsapp-web.js`. A quebra por parte de uma atualização oficial da Meta exigirá refatoração imediata em `messages` e nos `webhooks`.
3. **Refatoração no modulo `settings`**: Qualquer atualização deve focar em consertar imediatamente a consulta bruta de `daysToClose` que atualmente viola o particionamento isolado do Multi-Tenant.
