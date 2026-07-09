# Requirements: Módulo de Filas (Queues)

> Identificador: `006-filas`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo de Filas (Queues) serve como a estrutura de roteamento e departamentalização do call center (ex: Vendas, Suporte, Financeiro). Cada fila possui configuração própria de horários de expediente, mensagens automáticas de saudação e de ausência, e uma cor de identificação visual no painel.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:queues` | CRUD de Filas com validação de horário de funcionamento (`schedules`) e cores. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:queues` | Tabela `Queue` vincula-se a `Tenant`, `Whatsapp`, `Ticket` e `User`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador | Departamentalizar | Cria a fila "Suporte Técnico", define a cor azul, associa quais operadores atendem nela e vincula a uma opção do bot de autoatendimento. |
| Administrador | Expediente Customizado | Define que a fila "Comercial" só funciona de 08:00 às 18:00. Fora disso, o bot envia a `outOfHoursMessage` específica daquela fila. |
| Operador | Filtrar caixa de entrada | Utiliza as tags visuais (cores) e o seletor de filas para enxergar apenas os chamados de sua competência. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O expedientes configurados no array JSON `schedules` sobrescrevem o expediente geral da Empresa caso o cliente chegue diretamente no contexto da fila. 🟢
2. **RN-02:** A exclusão de uma Fila que já possui tickets associados afeta a integridade; a constraint requer realocação ou bloqueio. 🟢
3. **RN-03:** As conexões de WhatsApp (`Whatsapp`) podem estar vinculadas a múltiplas filas, agindo como as "portas de entrada" da central. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Filas | Must | Criar, Listar, Atualizar e Deletar departamentos no painel. | 🟢 |
| RF-02 | Configuração de Horários | Must | Salvar os slots de dias/horas (`schedules`) nativamente em cada fila. | 🟢 |
| RF-03 | Mensagens Departamentais | Must | Configurar `greetingMessage` e `outOfHoursMessage` por fila. | 🟢 |
| RF-04 | Associação Visual | Should | Requerer um código hexadecimal (`color`) obrigatório na criação para colorir as tags no frontend. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Armazenamento de Expediente | Uso de JSON/JSONB para `schedules` em vez de criar tabela filha relacional 1:N por dia da semana. | 🟢 |
| Segurança | Multi-tenancy | Queries sempre acompanhadas do `tenantId` para não vazar a fila "Financeiro" da Empresa A para a B. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Atendimento fora do expediente da fila
  Dado que um Ticket foi direcionado à Fila "Suporte"
  E o horário atual é 20:00 (fora do "schedules" da Fila)
  Quando o cliente envia uma mensagem
  Então o sistema não notifica o operador
  E dispara automaticamente a "outOfHoursMessage" configurada naquela Fila específica.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Departamentos) | Must | Funcionalidade mandatória para empresas maiores que 1 atendente. |
| RF-02 (Horários por Fila) | Must | Fundamental para empresas onde Vendas opera fds, mas Suporte não. |
| RF-04 (Cor Visual) | Should | Impacta fortemente a experiência de triagem visual do operador (UX). |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
