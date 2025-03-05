# Melhorias de Responsividade para Dispositivos Móveis

Este documento descreve as melhorias implementadas nos componentes de visualização de mídia para garantir uma melhor experiência em dispositivos móveis, especialmente em telas menores que 500px.

## Visão Geral

As modificações visam:
- Limitar o tamanho de imagens, vídeos, PDFs e outros arquivos para melhor visualização em telas pequenas
- Padronizar o uso de unidades relativas (vh/vw) em vez de pixels fixos
- Utilizar unidades de viewport (vh/vw) para garantir adaptação automática a diferentes tamanhos de tela
- Melhorar a experiência do usuário em dispositivos móveis
- Garantir alinhamento e encaixe adequados dentro dos contêineres pai

## Padronização de Unidades

Uma das principais melhorias foi a padronização dos componentes para usar consistentemente:
- **Unidades vh (Viewport Height)** para alturas em vez de pixels fixos
- **Cálculos dinâmicos** baseados na proporção da tela
- **Limites relativos** para máximos e mínimos (ex: max-height: 75vh)
- **Alinhamento centralizado** usando flexbox em todos os componentes

Esta abordagem garante que os componentes sejam escaláveis e respondam bem a diferentes tamanhos de tela.

## Componentes Modificados

### MediaViewer
- Ajuste das margens para economizar espaço vertical (10px auto, 5px em mobile)
- Estilização responsiva para o contêiner de mídia desconhecida
- Padronização para uso de unidades vh
- Centralização usando flexbox (justify-content: center, align-items: center)

### ImageViewer
- Altura mínima e máxima baseada em viewport height (40vh-70vh)
- Redimensionamento específico para imagens em formato vertical e horizontal
- Ajustes em botões de ação para melhor acessibilidade em telas de toque
- Remoção de duplicação nas media queries
- Alinhamento centralizado com margem uniforme (0 auto)

### VideoViewer
- Substituição de alturas fixas (px) por unidades relativas (vh)
- Cálculo dinâmico baseado na proporção do vídeo usando unidades vh e vw
- Altura e largura com base em porcentagens do viewport (75vh, 80vw)
- Otimização para vídeos verticais e horizontais com alinhamento centralizado
- Ajustes nos botões de ação para dispositivos móveis (opacidade: 1)

### DocumentViewer
- Adaptação dinâmica de PDFs usando porcentagens do viewport (50vh-75vh)
- Método `adjustPdfHeight` reescrito para usar 30vh mínimo e 75vh máximo
- Ajuste da altura máxima e mínima dos containeres de arquivos (40vh-75vh)
- Otimização da visualização de Excel e outros documentos
- Tamanho de fonte e padding ajustados para telas menores
- Centralização usando flexbox com alinhamento vertical e horizontal

## Implementação

As principais abordagens de implementação incluem:

1. **Uso de vh (Viewport Height)**:
   - Substituição completa de alturas fixas (px) por unidades relativas (vh)
   - Definição de limites mínimos (30vh-45vh) e máximos (70vh-75vh) padronizados
   - Uso de `calc()` para calcular dimensões preservando a proporção original

2. **Flexbox para Alinhamento**:
   - Todos os componentes agora usam `display: flex` com `justify-content: center`
   - Containers internos centralizam seu conteúdo com `align-items: center`
   - Uso de `margin: auto` para centralização adicional

3. **Media Queries Otimizadas**:
   - Regras específicas para telas menores que 500px
   - Ajustes finos para diferentes proporções de tela
   - Redução das dimensões em telas pequenas (ex: 30vh mínimo em vez de 40vh)
   - Remoção de duplicações nas media queries

4. **Melhorias de Usabilidade**:
   - Botões de ação com maior visibilidade em dispositivos móveis
   - Opacidade permanente para botões em telas de toque
   - Tamanhos de fonte ajustados para melhor legibilidade

## Testes

Estas melhorias foram testadas em diversos dispositivos móveis com tamanhos de tela variados, incluindo:
- Smartphones com telas pequenas (<5 polegadas)
- Smartphones com telas médias (5-6 polegadas)
- Tablets e dispositivos com telas maiores
- Diferentes proporções de tela (16:9, 18:9, 20:9)
- Orientações retrato e paisagem

## Futuras Melhorias

Possíveis aprimoramentos futuros podem incluir:
- Implementação de gestos de toque específicos (pinch to zoom)
- Carregamento adaptativo de imagens para conexões lentas
- Otimização adicional para orientação de tela (landscape/portrait)
- Uso de CSS Container Queries quando o suporte ao navegador for mais amplo 