# Requirements: Módulo de Estatísticas (Dashboard)

> Identificador: `012-estatisticas`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo fornece os dados agregados para os gráficos e painéis gerenciais (Dashboard) do sistema. Calcula métricas chaves de call center como TME (Tempo Médio de Espera), TMA (Tempo Médio de Atendimento), volume de chamados por fila/atendente e os scores de avaliação (NPS/CSAT) deixados pelos clientes ao final do atendimento.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:statistics` | Controllers agregadores usando Raw SQL ou funções complexas do Sequelize para montar os relatórios de tela. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:statistics` | Baseia-se fortemente na tabela `Ticket`, `LogTicket` e `UserRating`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Coordenador / Gerente | Monitorar SLA | Entra no painel e seleciona a data "Hoje" para verificar se o TME está alto, decidindo alocar mais operadores para o Suporte. |
| Coordenador / Gerente | Avaliar Equipe | Tira o relatório mensal para verificar qual operador realizou mais fechamentos de ticket e qual obteve a melhor nota de NPS. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Todos os cálculos estatísticos devem respeitar estritamente os parâmetros de intervalo de data (`date_from` e `date_to`) para evitar consultas full-table scan. 🟢
2. **RN-02:** O cálculo de TME e TMA deve isolar as interações de "Bot". O tempo de espera deve ser contado a partir do momento que o ticket entra na fila para um humano, até o humano aceitar (`open`). 🟡
3. **RN-03:** Gerentes enxergam as métricas do Tenant inteiro; operadores comuns devem enxergar um dashboard restrito apenas às suas próprias métricas (se o acesso não for bloqueado na UI). 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Cards de Resumo | Must | Retornar totalizadores: Atendimentos em andamento, Pendentes, Resolvidos no período. | 🟢 |
| RF-02 | Gráfico de Volume por Fila | Must | Retornar array agregado contando quantos tickets foram fechados divididos por `queueId`. | 🟢 |
| RF-03 | Cálculo de TMA e TME | Must | Calcular e retornar a média de tempo formatada ou em minutos. | 🟢 |
| RF-04 | Avaliações (NPS) | Must | Agregar as avaliações dadas na tabela `UserRating` por nota (Promotores, Neutros, Detratores) e média geral. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Índices de Banco | Consultas de `COUNT(*)` com `GROUP BY` e faixas de data precisam de índices no Postgres (`createdAt`, `tenantId`) sob pena de lentidão severa. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Filtro Seguro de Dashboard
  Dado que um Administrador seleciona o filtro "Últimos 7 dias"
  Quando ele aciona a rota GET /dash/tickets-indicators
  Então o banco deve receber a query contendo o `tenantId` da empresa
  E as datas formatadas corretamente (início do dia 1 até final do dia 7)
  E retornar a estrutura agregada no JSON.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Resumos) | Must | O primeiro componente que o cliente vê após o login. |
| RF-03 (TMA/TME) | Must | Valor core do produto SaaS de call center. |
| RF-04 (NPS) | Should | Diferencial competitivo, agrega muito valor. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
