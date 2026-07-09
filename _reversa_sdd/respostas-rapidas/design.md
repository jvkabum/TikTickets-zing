# Respostas Rápidas, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Modelagem de MediaType JSON flexível com validador IsArray | Restrição `isArrayOfStrings` no Sequelize | 🟢 |
| Fallback Hardcoded de URL | Em caso de quebra da variável BACKEND_URL, preenche uma string chumada ("https://backend...") | 🟢 |

## Estado Interno
As entidades de Atalhos são imutáveis em termos transacionais, funcionando como Biblioteca Auxiliar do Atendimento.
