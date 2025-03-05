# Componentes

## MediaPreview

O componente `MediaPreview` é responsável por exibir uma pré-visualização de diferentes tipos de mídia antes do envio.

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