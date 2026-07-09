# Relatório de Confiança — TikTickets-zing

> Gerado pelo Revisor em 2026-07-09

---

## Resumo Geral

| Nível | Quantidade | Percentual |
|-------|-----------|------------|
| 🟢 CONFIRMADO | 185 | 86% |
| 🟡 INFERIDO   | 30  | 14% |
| 🔴 LACUNA     | 0   | 0%  |
| **Total**     | 215 | 100% |

**Confiança geral:** 93% (soma de 🟢 + metade dos 🟡)

---

## Por Spec (Módulos Principais)

| Spec | 🟢 | 🟡 | 🔴 | Confiança |
|------|----|----|-----|-----------|
| `autenticacao` | 18 | 2 | 0 | 95% |
| `empresas` | 14 | 3 | 0 | 91% |
| `tickets` | 25 | 4 | 0 | 93% |
| `contatos` | 12 | 2 | 0 | 92% |
| `chatflow` | 20 | 5 | 0 | 90% |
| `canais` | 15 | 3 | 0 | 91% |
| `estatisticas` | 16 | 2 | 0 | 94% |
| `configuracoes` | 10 | 1 | 0 | 95% |
| `filas` | 12 | 2 | 0 | 92% |
| `respostas-rapidas` | 10 | 1 | 0 | 95% |
| Demais Módulos | 33 | 5 | 0 | 93% |

---

## Lacunas Pendentes 🔴

Nenhuma! Todas as 9 lacunas identificadas durante a revisão cruzada foram validadas e resolvidas pelo usuário via `questions.md`.

---

## Histórico de Reclassificações (Respostas Incorporadas)

| De | Para | Afirmação | Evidência |
|----|------|-----------|-----------|
| 🔴 | 🟢 | **Múltiplos Logins**: É permitido que um usuário faça múltiplos logins na mesma conta simultaneamente em dispositivos diferentes. | Validação Humana (questions.md#Q1) |
| 🔴 | 🟢 | **Duração do JWT**: Access Token e Refresh Token têm expiração de 24 horas. | Validação Humana (questions.md#Q2) |
| 🔴 | 🟢 | **Contatos (Meta)**: Não haverá fallback em caso de queda do WhatsApp, será mantido o comportamento atual. | Validação Humana (questions.md#Q3) |
| 🔴 | 🟢 | **Exclusão Tenant**: O comportamento atual de exclusão será mantido. | Validação Humana (questions.md#Q4) |
| 🔴 | 🟢 | **Estatísticas TMA/TME**: Será forçado um Timezone explícito na querystring e os cálculos serão resolvidos via SQL/EXTRACT. | Validação Humana (questions.md#Q5) |
| 🔴 | 🟢 | **Exclusão Filas**: Os tickets de uma fila excluída serão transferidos para outra fila do tenant. | Validação Humana (questions.md#Q6) |
| 🔴 | 🟢 | **Respostas Rápidas**: Mantém-se o comportamento do legado para atalhos duplicados. | Validação Humana (questions.md#Q7) |
| 🔴 | 🟢 | **Concorrência Tickets**: Em caso de lock concorrente ao "Aceitar", o ticket vai para quem tem menos atendimento em andamento. | Validação Humana (questions.md#Q8) |
| 🔴 | 🟢 | **Configurações**: Todos os serviços que buscam `Settings` exigirão `tenantId` (correção de segurança). | Validação Humana (questions.md#Q9) |
