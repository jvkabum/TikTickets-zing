# Componente DocumentViewer

Este componente oferece visualização para diferentes tipos de documentos (PDF, Excel, entre outros).

## Visualizador de PDF

O visualizador de PDF foi projetado para oferecer uma experiência completa de visualização de documentos PDF diretamente no navegador, sem a necessidade de plugins ou aplicativos externos.

### Funcionalidades

- **Controle de Zoom**: Aumentar, diminuir e resetar o zoom do documento
- **Navegação de Páginas**: Botões para avançar e voltar páginas (quando disponível)
- **Tela Cheia**: Modo de visualização em tela cheia para melhor leitura
- **Imprimir**: Botão direto para impressão do documento
- **Abrir em Nova Aba**: Para visualização nativa do navegador
- **Interface Responsiva**: Adaptação para diferentes tamanhos de tela, incluindo dispositivos móveis
- **Suporte para Tema Escuro**: Adapta-se ao tema dark do aplicativo

### Uso

```vue
<DocumentViewer 
  :src="urlDoDocumento" 
  :fileName="nomeDoArquivo" 
/>
```

#### Props

| Nome | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| src | String | Sim | - | URL do documento a ser exibido |
| fileName | String | Não | '' | Nome personalizado para o documento |

### Limitações Técnicas

- A detecção do número de páginas é aproximada devido a restrições de CORS em documentos externos
- Para documentos PDF hospedados em domínios diferentes, algumas funcionalidades podem ser limitadas por questões de segurança do navegador

### Exemplos de uso

```vue
<!-- Exemplo básico -->
<DocumentViewer src="https://exemplo.com/documento.pdf" />

<!-- Com nome personalizado -->
<DocumentViewer 
  src="https://exemplo.com/documento.pdf" 
  fileName="Relatório Anual 2023" 
/>
```

## Visualizador de Excel

O componente também oferece suporte para visualização de arquivos Excel.

### Funcionalidades

- Exibição de prévia dos dados em formato tabular
- Visualização expandida em modal
- Suporte para temas claro e escuro

## Outros Formatos

Para outros formatos de arquivo, o componente exibe uma representação visual com ícone e informações básicas do arquivo. 