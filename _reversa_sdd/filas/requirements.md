# Filas (Queues)

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Gerencia os departamentos ou setores de atendimento do sistema, permitindo que a força de trabalho (Usuários) seja dividida organizativamente.

## Responsabilidades
- Criar e listar as Filas de atendimento.
- Vincular filas a Usuários e ChatFlows para segmentação.
- Evitar deleções de filas que possuem atendimentos atrelados.

## Regras de Negócio
- Apenas usuários com `profile === "admin"` podem criar, editar e excluir as filas 🟢
- A leitura das filas existentes é irrestrita para qualquer funcionário logado do Tenant 🟢
- O sistema impedirá categoricamente a exclusão de qualquer Fila que já detenha Histórico ou Tickets ativos (através de restrição de Chave Estrangeira e bloqueio amigável no backend) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD e Validação de Filas | Must | Administradores podem cadastrar o nome e a cor (opcional) do departamento. |
| RF-02 | Status Ativo/Inativo | Should | Poder suspender o uso de uma fila sem deletar seu histórico passado via `isActive`. |
| RF-03 | Proteção de Deleção em Cascata | Must | Não permitir exclusão da Fila caso existam registros transacionais atrelados. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Arquitetura | Banco de Dados Racional FK | Exclusão do Controller engole o erro de Constraint `ERR_QUEUE_TICKET_EXISTS` | 🟢 |

> Inferido a partir do código. Validar com equipe de operações.

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD Básico | Must | Elemento central da interface de Triagem. |

> Prioridade inferida por frequência de chamada e posição na cadeia de dependências.

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/QueueController.ts` | CRUD Base | 🟢 |
| `backend/src/services/QueueIntegrationServices/DeleteQueueService.ts` | Deleção protegida | 🟢 |
