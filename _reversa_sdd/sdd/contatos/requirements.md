# Requirements: Módulo de Contatos (Contacts)

> Identificador: `005-contatos`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo gerencia a agenda (CRM interno) dos clientes ou leads do sistema. Mantém os dados cadastrais (nome, número, e-mail) e campos customizados extras (ContactCustomField), sendo essencial para identificar quem está enviando a mensagem e manter o histórico de relacionamento unificado entre dezenas de tickets gerados pelo mesmo número de WhatsApp.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:contacts` | CRUD de contatos, bloqueio de duplicação por Tenant e gestão de `extraInfo`. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:contacts` | Tabela `Contact` e relacionamento de 1:N com `ContactCustomField`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Cliente Final | Ser reconhecido | Quando envia um "Oi" pela primeira vez, o bot cria o Contato usando o número. Em contatos futuros, o sistema reaproveita o mesmo registro. |
| Operador | Enriquecer Lead | Durante o atendimento, preenche campos extras do Contato (Ex: CPF, CNPJ, Data de Nascimento) para que fiquem salvos permanentemente. |
| Administrador | Importação | Faz upload de uma planilha para pré-cadastrar 1000 leads antes de disparar uma campanha. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Um contato é identificado unicamente pela composição de `number` (com DDI/DDD) + `tenantId`. Não podem existir dois contatos com o mesmo número dentro da mesma empresa. 🟢
2. **RN-02:** Um contato pode ser "Pessoa/Número individual" ou um "Grupo do WhatsApp" (flag `isGroup`). 🟢
3. **RN-03:** O contato pode receber ilimitados campos dinâmicos atrelados (`ContactCustomField`), geridos como array de Name/Value em sua criação ou edição. 🟢
4. **RN-04:** Quando uma foto de perfil (`profilePicUrl`) é detectada no WhatsApp, ela deve atualizar o banco de dados local para exibir no Inbox. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Contatos | Must | Permite criar, ler, atualizar e excluir contatos manualmente pelo painel. | 🟢 |
| RF-02 | Tratamento de Campos Extras | Must | O array `extraInfo` fornecido no payload deve refletir atualizações (Upsert/Delete) na tabela filha `ContactCustomField`. | 🟢 |
| RF-03 | Criação Automática (Bot) | Must | Se uma mensagem chegar de um número desconhecido, o serviço de WWebJS deve acionar silenciosamente o `CreateContactService`. | 🟢 |
| RF-04 | Busca Avançada | Should | O operador pode pesquisar um contato pelo nome ou trecho do número na tela de agenda. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Integridade | Índice Único no BD | Constraint Unique em `(number, tenantId)` no Postgres. | 🟢 |
| Desempenho | Paginação e Busca | A agenda pode ter dezenas de milhares de registros; requer LIMIT e OFFSET na API. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Bloqueio de duplicidade na criação manual
  Dado que já existe o contato "551199999999" na Empresa A
  Quando um Operador tentar criar um novo contato com este mesmo número
  Então a API rejeita com status HTTP 400
  E a mensagem avisa que o número já está registrado.

Cenário: Atualização de campos extras
  Dado que um Contato é atualizado via PUT passando 2 itens no array "extraInfo"
  Quando o sistema salva
  Então os campos anteriores são deletados ou atualizados 
  E a tabela "ContactCustomField" reflete os dados corretos vinculados ao "contactId".
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (CRUD base) | Must | Sustentação básica de CRM. |
| RF-02 (Campos Extras) | Must | Diferencial de software corporativo vs WhatsApp web comum. |
| RF-03 (Criação Bot) | Must | Sem isso o inbox quebra ao receber mensagens frias. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
