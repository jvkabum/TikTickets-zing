# Matriz de Rastreabilidade (Code vs Spec)

Cruza os módulos físicos descobertos no código contra os artefatos de Especificação Guiada por Domínio (SDD) gerados pelo `/reversa-writer`. Serve como prova de cobertura da engenharia reversa.

| Módulo do Código Original | Pasta SDD (reversa) | Artefatos Gerados | Cobertura |
|---------------------------|---------------------|-------------------|-----------|
| `backend/src/controllers/AuthController.ts` | `sdd/autenticacao/` | `req, design, tasks` | 100% |
| `backend/src/controllers/TenantController.ts` | `sdd/tenants/` | `req, design, tasks` | 100% |
| `backend/src/controllers/UserController.ts` | `sdd/usuarios/` | `req, design, tasks` | 100% |
| `backend/src/controllers/TicketController.ts` | `sdd/tickets/` | `req, design, tasks` | 100% |
| `backend/src/controllers/ContactController.ts`| `sdd/contatos/` | `req, design, tasks` | 100% |
| `backend/src/controllers/QueueController.ts` | `sdd/filas/` | `req, design, tasks` | 100% |
| `backend/src/controllers/ChatFlowController.ts`| `sdd/chatflow/` | `req, design, tasks` | 100% |
| `backend/src/controllers/WhatsAppController.ts`| `sdd/canais/` | `req, design, tasks` | 100% (S/ contracts) |
| `backend/src/controllers/CampaignController.ts`| `sdd/campanhas/` | `req, design, tasks` | 100% |
| `backend/src/controllers/QuickMessageController.ts`| `sdd/respostas-rapidas/` | `req, design, tasks` | 100% |
| `backend/src/controllers/SettingController.ts` | `sdd/configuracoes/` | `req, design, tasks` | 100% |
| `backend/src/controllers/StatisticsController.ts`| `sdd/estatisticas/` | `req, design, tasks` | 100% |
| `backend/src/controllers/ApiController.ts` | `sdd/integracao-api/` | `req, design, tasks` | 100% |

> **Nota:** Todos os 13 módulos identificados no plano `actions.md` foram processados com sucesso pelo Agente Writer. O sistema está plenamente especificado e pronto para a fase de revisão/auditoria.
