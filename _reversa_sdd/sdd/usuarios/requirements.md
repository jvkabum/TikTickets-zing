# Requirements: Módulo de Usuários (Users)

> Identificador: `003-usuarios`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O módulo gerencia os operadores e administradores do sistema. Engloba o CRUD completo, paginação, edição de configurações pessoais e impõe travas de segurança tanto para exclusão acidental (protegendo histórico de atendimento) quanto restrições de cota financeira baseada em licenças.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/code-analysis.md#Módulo:users` | Deleção segura baseada em tickets abertos. Emissão de sockets. Checagem dupla de limites de cota. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Módulo:users` | Entidade Principal `User` e a Pivot `UsersQueues` que vincula Atendente a Fila. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Administrador (Tenant) | Criar contas para equipe | Cadastra novos atendentes, vinculando as permissões e Filas de atendimento pertinentes. |
| Administrador (Tenant) | Desligar operador | Exclui a conta de um atendente. Se ele tiver tickets pendentes, o sistema realoca para evitar perda de clientes. |
| Operador | Personalizar uso | Modifica o campo `configs` (JSON) para alterar preferências da interface web. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Usuários só podem ser criados se o total de usuários ativos do Tenant for MENOR que a propriedade `maxUsers` associada a essa conta, e MENOR que o limite global da plataforma (`.env.USER_LIMIT`). 🟢
2. **RN-02:** Cadastro livre (Signup) só funciona se o parâmetro `userCreation` no Tenant permitir; do contrário, rotas de criação exigem autenticação prévia e perfil de `admin`. 🟢
3. **RN-03:** A Deleção de um usuário sofre Hard Block se houver `Tickets` com status não-resolvido associados a ele, obrigando a re-atribuição ou encerramento (via helper `UpdateDeletedUserOpenTicketsStatus`). 🟢
4. **RN-04:** Configurações de interface (modo noturno, alertas) são armazenadas de forma flexível como chaves do objeto JSON na coluna `configs`. 🟢

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | CRUD de Usuários | Must | Permite criar, listar (com paginação), editar e inativar. | 🟢 |
| RF-02 | Proteção contra Exclusão | Must | O banco não permite deletar o operador sem realocar tickets abertos. | 🟢 |
| RF-03 | Vinculação em Filas | Must | Associa quais filas/setores (ex: Financeiro, Suporte) cada operador enxerga (`UsersQueues`). | 🟢 |
| RF-04 | Emissão via Socket | Should | Criar/Atualizar um usuário dá trigger no canal para refletir os nomes na UI em tempo real. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Escalabilidade | Paginação Nativa | Uso do `ListUsersService` processa limit e offset, evitando crashes com Tenants gigantescos. | 🟢 |
| Integridade | Relacionamento Constraint | O Banco Postgres possui constraints de foreign key que barram exclusão suja. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Exclusão falha por ticket aberto
  Dado que um Operador tem 2 tickets com status "open" atribuídos a ele
  Quando um Admin tentar usar o endpoint de DELETE
  Então o sistema deve chamar o UpdateDeletedUserOpenTicketsStatus
  E a deleção não é efetivada sem passar o parâmetro de nova Fila/Usuário

Cenário: Vinculação de Operador na Fila
  Dado que o Admin cria um Usuário novo
  Quando passa o array de "queueIds" no payload JSON
  Então a tabela pivot "UsersQueues" é populada
  E o Operador só verá tickets dessas filas designadas
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (CRUD) | Must | Base do sistema corporativo multi-operador. |
| RF-02 (Trava Exclusão) | Must | Evita perda irreparável de clientes que sumiriam do painel. |
| RF-03 (Filas) | Must | Organização de departamentos. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- Nenhuma lacuna crítica de conhecimento identificada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-writer` | reversa |
