# Campanhas, Tarefas de Implementação

> Template do arquivo `tasks.md`. Foca em uma sequência de tarefas executáveis para reimplementar a unit a partir do legado, com rastreabilidade ao código original.

## Tarefas

- [ ] T-01, Disparo Redis Delay (P.A.)
  - Origem no legado: `backend/src/services/CampaignServices/StartCampaignService.ts`
  - Critério de pronto: Loop que anexa Jobs na Fila iterando o delay em progressão para criar espaçamento natural e randomizar a mensagem 1/2/3.
  - Confiança: 🟢

- [ ] T-02, Scheduler Fora do Expediente
  - Origem no legado: `nextDayHoursValid` helpers.
  - Critério de pronto: Lógica datetime que converte agendamento da madrugada pra manhã seguinte.
  - Confiança: 🟢

- [ ] T-03, Hook Reconciliador Automático
  - Origem no legado: `backend/src/models/Campaign.ts` (@AfterFind)
  - Critério de pronto: Inspecionar o objeto extraído. Se somatória de lidos+recebidos = totais, alterar o Model silenciosamente.
  - Confiança: 🟢
