# Componentes

## MediaPreview

O componente `MediaPreview` foi aprimorado para oferecer uma melhor experiência ao usuário:

### Melhorias Implementadas

1. **Tamanho e Posicionamento**
   - Aumento do tamanho do preview de 250px para 400px de largura
   - Aumento da altura máxima do conteúdo de 250px para 350px
   - Centralização do preview na tela (anteriormente posicionado à direita)

2. **Visual**
   - Adição de bordas arredondadas (8px)
   - Implementação de sombra para destacar o preview
   - Melhoria no contraste com fundo semi-transparente
   - Ajuste do cabeçalho para melhor legibilidade

3. **Interatividade**
   - Fechamento do preview com a tecla ESC
   - Fechamento ao clicar fora da área do preview
   - Foco automático para facilitar o uso do teclado

4. **Acessibilidade**
   - Suporte completo ao modo escuro
   - Melhor contraste para leitura de informações
   - Tamanho de fonte ajustado para melhor legibilidade

### Integração com o Chat

O componente foi integrado ao chat de forma a:
- Aparecer centralizado sobre o conteúdo
- Manter consistência visual com outros elementos da interface
- Seguir o mesmo padrão de interação do seletor de emoji

### Próximas Melhorias Planejadas

- Adicionar zoom para imagens
- Implementar controles de navegação para múltiplos arquivos
- Melhorar a visualização em dispositivos móveis

### Funcionalidades

- Suporta visualização de imagens, vídeos, áudios e documentos
- Exibe informações como nome do arquivo e tamanho
- Botão para remover o arquivo
- Design responsivo

### Uso

```vue
<MediaPreview
  :file="arquivo"
  @close="removerArquivo"
/>
```

### Props

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| file | File/Blob | Sim | O arquivo a ser pré-visualizado |

### Eventos

| Nome | Parâmetros | Descrição |
|------|------------|-----------|
| close | - | Emitido quando o usuário clica no botão de fechar |

### Tipos de Mídia Suportados

- **Imagens**: jpg, png, jpeg, gif, etc.
- **Vídeos**: mp4, webm, ogg, etc.
- **Áudios**: mp3, wav, ogg, etc.
- **Documentos**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, etc.

### Integração com InputMensagem

O componente é utilizado no `InputMensagem.vue` para exibir uma pré-visualização dos arquivos antes do envio. 