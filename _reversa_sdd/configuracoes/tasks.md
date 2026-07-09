# Configurações, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, CRUD e Sincronia
  - Origem no legado: `backend/src/controllers/SettingController.ts`
  - Critério de pronto: Endpoint que edite ou grave pares, devolvendo evento de update em Broadcast para toda a sala da empresa.
  - Confiança: 🟢

- [ ] T-02, **[Refatoração]** Correção da Raw SQL Vulnerável
  - Origem no legado: `backend/src/services/TicketServices/ConfiguraFechamentoTicketService.ts`
  - Critério de pronto: Reescrever o script em background para buscar o respectivo limitador temporal (`daysToClose`) atrelado a CADA Tenant e aplicar o fetch individualmente na busca por Tickets para fechamento automático.
  - Confiança: 🟢
