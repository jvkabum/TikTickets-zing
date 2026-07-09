# Campanhas, Design Técnico

> Template do arquivo `design.md`. Foca no COMO a unit é construída, com base no código legado lido.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| P.A. (Progressão Aritmética) em Delays Redis | O tempo `timeDelay` é multiplicado pela iteração (20s, 40s, 60s...) | 🟢 |
| Interpolação Textual Pupa | Renderização do conteúdo injetando nomes do Contato via library auxiliar | 🟢 |
| Transação de Status Passiva em Selects | Hook `@AfterFind` escaneia todas as Queries SELECT do BD e muda pra "finished" se matemática bater | 🟢 |

## Fluxos Alternativos
- **Mutações Visuais de Path Mídia:** Getters nativos interceptam o path do arquivo de Media e geram link completo HTTP do Backend URL evitando falhas no WhatsApp JS que requisita buffer de stream direto da WEB.
