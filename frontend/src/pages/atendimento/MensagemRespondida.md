# Componente MensagemRespondida

Este componente é responsável por exibir mensagens no chat, incluindo a funcionalidade de responder mensagens.

## Funcionalidades

- Exibe mensagens de texto, áudio, imagem, vídeo e outros tipos de mídia
- Suporte para mensagens respondidas (quoted messages)
- Suporte para mensagens em grupo
- Visualização de arquivos e downloads
- Lightbox para imagens
- Suporte para enquetes

## Props

- `mensagem`: Object (required) - Objeto contendo os dados da mensagem
- `size`: String | Number (default: '5') - Tamanho da mensagem
- `isLineDate`: Boolean (default: true) - Exibe a data da mensagem
- `replyingMessage`: Object - Mensagem que está sendo respondida

## Eventos

- `responder-mensagem`: Emitido quando uma mensagem é clicada para resposta
- `mensagem-respondida:focar-mensagem`: Emitido para focar em uma mensagem específica

## Exemplo de Uso

```vue
<MensagemRespondida
  :mensagem="mensagem"
  @responder-mensagem="handleResponderMensagem"
/>
```

## Estrutura da Mensagem

A mensagem deve conter as seguintes propriedades:

```javascript
{
  id: String,
  body: String,
  fromMe: Boolean,
  mediaType: String, // 'chat', 'audio', 'image', 'video', 'application', 'vcard', 'poll_creation'
  mediaUrl: String,
  quotedMsg: Object, // Mensagem que está sendo respondida
  contact: {
    name: String
  },
  isDeleted: Boolean,
  updatedAt: Date
}
```

## Estilos

O componente inclui estilos para:
- Mensagens normais
- Mensagens respondidas (quoted messages)
- Enquetes
- Diferentes tipos de mídia
- Layout responsivo 