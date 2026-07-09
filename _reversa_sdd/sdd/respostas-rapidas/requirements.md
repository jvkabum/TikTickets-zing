# Requirements: Módulo de Respostas Rápidas (Fast Replies / Quick Messages)

> Identificador: `010-respostas-rapidas`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo fornece atalhos de texto para os operadores acelerarem o atendimento. Ao digitar um "shortcode" (ex: `/pix`), o sistema expande para um bloco de texto completo (ex: "Nossa chave PIX é..."). Reduz a fadiga de digitação e padroniza o tom de voz da empresa.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:fast-replies` | CRUD de Respostas Rápidas (`QuickMessageController`) com vinculação a `TenantId` e `UserId`. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:fast-replies`| Entidade `QuickMessage` armazenando o atalho (`shortcode`) e a resposta longa (`message`). | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador | Padronização | Cria respostas rápidas globais visíveis para toda a equipe ("Bom dia, como posso ajudar?"). |
| Operador | Produtividade | Cria suas próprias respostas pessoais vinculadas apenas ao seu `userId`. Durante o chat, ao digitar `/`, um menu suspenso (Frontend) exibe suas opções. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** As respostas rápidas podem ser globais (onde `userId` é nulo, sendo visíveis a todos do Tenant) ou pessoais (onde `userId` está preenchido). 🟢
2. **RN-02:** O campo `shortcode` não permite duplicidade dentro do mesmo escopo de Tenant/User, para evitar ambiguidade na expansão do atalho. 🟢
3. **RN-03:** A lista deve suportar ordenação alfabética ou buscas ilike, pois empresas grandes possuem centenas de atalhos. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Respostas | Must | Criar, Listar (com paginação e busca), Editar e Deletar. | 🟢 |
| RF-02 | Filtro de Escopo | Must | O endpoint GET deve retornar obrigatoriamente as globais + as pessoais do usuário que faz a requisição, filtrando as pessoais de terceiros. | 🟢 |
| RF-03 | Inserção de Variáveis | Should | Permitir (no Frontend e Backend) que o texto contenha chaves como `{name}` ou `{protocol}`. | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Cache Local (Front) | Por serem estáticas, o Frontend costuma solicitar a lista no login e mante-la na store (Pinia) para autocomplete instantâneo sem bater na API a cada keystroke. | 🟡 |
| Segurança | Multi-tenant | Respostas do Tenant A jamais vazam para o Tenant B. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Restrição de visibilidade de atalhos
  Dado que o Operador "João" criou a mensagem "/joao-bomdia" vinculada ao seu userId
  Quando o Operador "Maria" buscar a lista de respostas rápidas
  Então ela não enxerga o atalho de João,
  Mas enxerga os atalhos com userId = NULL.
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Gestão Base) | Must | Funcionalidade esperada em qualquer software de Zendesk/WhatsApp. |
| RF-02 (Escopo Privado) | Must | Operadores demandam autonomia sem poluir a lista global. |
| RF-03 (Variáveis dinâmicas) | Should | Muito útil para manter o tom humano sem esforço. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
