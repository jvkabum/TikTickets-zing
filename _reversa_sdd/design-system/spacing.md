# Espaçamento e Layout

> 🟢 Extraído de arquivo de configuração (`quasar.variables.sass` e `app.sass`)

## Escala de Espaçamento Base
O Quasar utiliza classes semânticas para padding e margens baseadas nas variáveis de SASS. No TikTickets-zing, os valores fundamentais de espaçamento (`$spacer`) estão definidos como:

| Token / Variável SASS | Valor SASS Original | Valor Calculado |
|-----------------------|---------------------|-----------------|
| `$spacer-sm` | `math.div($spacer, 2)` | `1.1rem` |
| `$spacer` | Base | `2.2rem` |
| `$spacer-lg` | `$spacer * 2` | `4.4rem` |
| `$headings-margin-bottom`| `$spacer-sm` | `1.1rem` |

## Variáveis Específicas de Layout
| Elemento de UI | Regra CSS / Variável | Descrição |
|----------------|----------------------|-----------|
| **Sidebar Fechada** | `$reduced-sidebar-width: 80px` | Tamanho do menu lateral quando minimizado |
| **Chat Bubbles** | `max-width: 80%` | Os balões de mensagem ocupam no máximo 80% da tela para manter clareza visual. |
