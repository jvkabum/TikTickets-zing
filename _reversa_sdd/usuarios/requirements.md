# Usuários

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia a força de trabalho (operadores e administradores) de cada Tenant, controlando suas permissões, configurações pessoais e distribuição em filas.

## Responsabilidades
- Prover CRUD e paginação de operadores.
- Impedir que as cotas de contratação do Tenant sejam excedidas na hora de cadastrar novos operadores.
- Prevenir inconsistências em atendimentos abertos ao impedir a exclusão abrupta de usuários que estão em operação.
- Emitir atualizações em tempo real para as interfaces web em caso de mutações cadastrais.

## Regras de Negócio
- A criação de operadores é bloqueada a menos que o Tenant tenha limite `maxUsers` disponível e não esbarre no `USER_LIMIT` da infraestrutura geral 🟢
- O Cadastro só é público se a configuração global `userCreation` permitir; caso contrário, apenas administradores autenticados podem criar 🟢
- Um usuário não pode ser excluído do sistema se possuir tickets associados a ele que ainda estejam com status "open" ou "pending" (Proteção ativa `UpdateDeletedUserOpenTicketsStatus`) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD de Usuários | Must | Administradores devem conseguir gerenciar dados de seus funcionários e vincular em quais filas (`UsersQueues`) eles atendem. |
| RF-02 | Validação de Cota | Must | Antes de finalizar o `store`, o sistema deve contar os usuários atuais do Tenant e bloquear se o teto for alcançado. |
| RF-03 | Exclusão Segura | Must | Ao tentar deletar um usuário, o sistema deve transferir seus tickets pendentes/abertos de volta à fila desvinculada ou encerrá-los. |
| RF-04 | Atualização de Mutações via Socket | Should | Ao editar nome ou fila de um usuário, os outros do tenant devem receber o refresh via WebSocket. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Broadcast WebSocket imediato em atualizações | `[tenantId]:user` channel hook | 🟢 |
| Escalabilidade | JSONB para configs arbitrárias | Coluna `configs` nativa para armazenar preferências individuais do front (dark mode, etc) sem mexer no schema | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Critérios de Aceitação

```gherkin
Dado que o tenant já esgotou a quantidade `maxUsers`
Quando o administrador tenta cadastrar o operador 11
Então o backend deve retornar mensagem amigável de erro informando limite excedido

Dado que um usuário "João" está em meio a 5 atendimentos e pede demissão
Quando o administrador solicita a deleção de "João"
Então o sistema bloqueia a exclusão fatal até que o Helper de segurança realoque ou finalize aqueles 5 tickets atrelados ao CPF/ID dele
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD com Validação de Cota | Must | Fonte direta de monetização do SaaS por pacotes de usuários. |
| Exclusão Segura | Must | Tickets "zumbis" travados na caixa de um usuário excluído quebram o SLA da empresa. |
| Vincular Operador a Fila | Must | Sem isso, não há triagem ou departamento de atendimento. |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/UserController.ts` | CRUD global paginado | 🟢 |
| `backend/src/services/UserServices/DeleteUserService.ts` | Prevenção de deleção bruta | 🟢 |
