# Design Tokens Consolidados

> 🟢 Extraído de arquivo de configuração (`quasar.variables.sass` e `app.sass`)

Esta tabela reúne as constantes CSS globais que definem a "estética Premium" da aplicação e modificam o comportamento padrão dos componentes Quasar.

| Categoria | Seletor/Token | Regra CSS | Impacto no Frontend |
|-----------|---------------|-----------|---------------------|
| Bordas | `.btn-rounded` | `border-radius: 12px !important` | Curvatura intermediária e suave. |
| Bordas | `.rounded-all` | `border-radius: 28px !important` | Curvatura máxima / Pílula (Pill). |
| Bordas | `.messageLeft`<br>`.messageRight` | `border-radius: 12px` <br> `border-top-left-radius: 2px` | Design assimétrico das bolhas de chat (parecido com iMessage/WhatsApp). |
| Sombras | `.shadow-premium` | `box-shadow: 0 20px 25px -5px ...` | Sombra extensa de elevação profunda. |
| Sombras | `.shadow-neon` | `box-shadow: 0 0 20px rgba(var(--q-primary), 0.2)` | Efeito brilhante que flui ao redor da caixa baseada na cor primária. |
| Vidro (Blur) | `.glass-premium` | `backdrop-filter: blur(14/16px)` | Criação do efeito Glassmorphism nos fundos e cards base. |
| Vidro (Blur) | `.glass-dark` | `backdrop-filter: blur(20px)` | Efeito Glassmorphism otimizado para cenários sem iluminação. |
| Vidro (Blur) | `.q-drawer`<br>`.q-header` | `backdrop-filter: blur(10px/12px)` | Translucidez aplicada nas barras fixas principais (header/menu). |
| Animações | `.hover-premium:hover` | `transform: translateY(-5px) scale(1.01)` | Micro-animação nos botões/cards ao repousar o mouse (`0.3s ease-in-out`). |
| Animações | `.q-page` | `animation: gradientBG 15s ease infinite` | O fundo muda suave e continuamente de cor através do keyframe. |
| Scrollbar | `::-webkit-scrollbar` | `width: 8px; border-radius: 10px;` | Scrollbar fino e estilizado para combinar com design macOS-like. |
