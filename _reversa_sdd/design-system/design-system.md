# Design System — TikTickets-zing

> 🟢 **CONFIANÇA: CONFIRMADO** (Extraído das configurações oficiais do Quasar e SCSS)

## Visão Geral
O TikTickets-zing utiliza **Quasar Framework v2** (Vue 3) com um ecossistema robusto de **Design Premium** construído customizando o Material Design padrão. Ele afasta-se da simplicidade nativa em favor de uma identidade moderna contendo:
- **Glassmorphism Baseado em Blur**: Aplicação massiva de `backdrop-filter: blur`, classes `.glass-premium` em diálogos, tabelas, headers e sidebars, gerando efeitos de vidro esfumaçado.
- **Gradientes Animados e Premium**: Abundância de classes utilitárias de gradiente (ex: `.grad-primary`, `.grad-success`) para botões. O app todo ganha vida via `@keyframes gradientBG` para fundos de tela com fluidez contínua.
- **Micro-animações**: A classe `.hover-premium` implementa elevações em eixos Y (`translateY(-5px)`) em cards interativos, garantindo resposta tátil em interfaces desktop.
- **Dark Mode Estruturado**: Suporte orgânico denso via seletor nativo `body.body--dark`, convertendo o glassmorphism e transparências em paletas opacas e densas (tons predominantes de `#1E293B` e `#10163a`).

## Estrutura de Documentos
Este diretório agrupa as regras visuais que orientam a interface gráfica do projeto, podendo ser consultado pelos desenvolvedores Front-end:
- [Paleta de Cores](./color-palette.md)
- [Sistema Tipográfico](./typography.md)
- [Espaçamento e Layout](./spacing.md)
- [Tokens Gerais e Animações](./tokens.md)

## Componentes Abstratos Nativos
A plataforma não importa outra biblioteca visual de terceiros, mas empacota classes CSS próprias que agem de fato como propriedades de um Design System isolado no DOM:
- **`.glass-premium`**: Aplique a qualquer elemento ou `.q-card` para instantaneamente se tornar um bloco translúcido de alta elevação.
- **`.hover-premium`**: Efeito em botões, tabelas ou listas clicáveis.
- **`.shadow-neon`**: Elementos de ênfase visual de ações principais que brilham externamente.
- **`.unified-modal-color`**: Padronização inteligente inserida em classes-raiz de `<q-dialog>`, resolvendo problemas de contraste entre modos Claro/Escuro sem precisar re-escrever customizações nos modais.
