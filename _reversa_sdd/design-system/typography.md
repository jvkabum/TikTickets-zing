# Sistema Tipográfico

> 🟢 Extraído de arquivo de configuração (`quasar.variables.sass` e `app.sass`)

## Família de Fontes
- **Base/Headings:** `'Nunito', sans-serif`
- **Monospace:** `'Nunito', sans-serif` (padrão forçado pelo sistema, substituindo font mono)

## Escala de Tamanhos
| Elemento / Variável | Tamanho | Rem equivalente (Base 16px) |
|---------------------|---------|-----------------------------|
| `$font-size-base` | `13px` | `0.8125rem` |
| `$font-size-small` | `~11px` | `0.6875rem` |
| `$font-size-large` | `~17px` | `1.0625rem` |
| `body` | `0.875rem`| `14px` |

## Hierarquia de Títulos (Headings)
Sobrescrita direta das tags nativas do Quasar no arquivo `app.sass`:

| Tag (`h1` a `h6`) e Classes | Tamanho CSS (`app.sass`) | Peso (Weight) |
|----------------------------|--------------------------|---------------|
| `h1`, `.text-h1` | `1.8rem` | `500` |
| `h2`, `.text-h2` | `1.6rem` | `500` |
| `h3`, `.text-h3` | `1.4rem` | `500` |
| `h4`, `.text-h4` | `1.2rem` | `500` |
| `h5`, `.text-h5` | `1.1rem` | `500` |
| `h6`, `.text-h6` | `1rem` | `500` |

## Pesos (Weights)
- `$font-weight-light`: `300`
- `$font-weight-normal`: `400`
- `$headings-font-weight`: `500`
- `$font-weight-bold`: `700`

## Altura de Linha (Line-height)
- **Base**: `1.45` ou `1.625rem` (dependendo do contexto de layout)
- **Headings**: `1.2`
