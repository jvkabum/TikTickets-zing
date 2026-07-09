# Tags

> Template do arquivo `requirements.md`. Foca no QUE a unit faz, não no como.

## Visão Geral
Fornece recursos de rotulagem e colorização visual em Tickets e Contatos (CRM Lite) para rápida categorização gerencial (ex: "Venda Quente", "Reclamação", "Urgente").

## Responsabilidades
- Criar CRUD global de Tags de um Tenant (Nome e Cor Hexadecimal).
- Anexar (Taggear) e Desanexar as etiquetas em um Ticket ativo ou no Perfil Perene do Contato.
- Possibilitar filtro de relatórios ou visualização em painel kanban pelas cores.

## Regras de Negócio
- A remoção de uma Tag global a esmaga em cascata de todos os tickets passados e presentes 🟢
- O Kanban Board só consegue montar colunas arrastáveis de Tickets baseando-se nas IDs destas Tags mapeadas 🟢

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `backend/src/controllers/TagController.ts` | CRUD global | 🟢 |
| `backend/src/controllers/TicketTagController.ts` | Anexo Pivô no Kanban | 🟢 |
