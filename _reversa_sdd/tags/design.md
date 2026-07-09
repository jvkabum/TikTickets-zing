# Tags, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Modelos N:M Pivôs | Tabelas `TicketTags` e `ContactCustomFields/Tag` | 🟢 |

## Estado Interno
As Tags operam como Enumeradores Modificáveis hospedados no Banco, determinando a renderização UI do Kanban.
