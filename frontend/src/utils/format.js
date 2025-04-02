export function formatarMensagemWhatsapp (text) {
  if (!text) return ''

  // Escapar caracteres HTML para evitar injeção de código
  let formattedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Substituir quebras de linha por <br>
  formattedText = formattedText.replace(/\n/g, '<br>')

  // Formatação de texto
  // Negrito: *texto* ou **texto**
  formattedText = formattedText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
  formattedText = formattedText.replace(/\*([\s\S]*?)\*/g, '<strong>$1</strong>')

  // Itálico: _texto_ ou __texto__
  formattedText = formattedText.replace(/__([\s\S]*?)__/g, '<em>$1</em>')
  formattedText = formattedText.replace(/_([\s\S]*?)_/g, '<em>$1</em>')

  // Tachado: ~texto~ ou ~~texto~~
  formattedText = formattedText.replace(/~~([\s\S]*?)~~/g, '<del>$1</del>')
  formattedText = formattedText.replace(/~([\s\S]*?)~/g, '<del>$1</del>')

  // Código em bloco: ```texto```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

  // Código inline: `texto`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Destacar emojis numeral
  formattedText = formattedText.replace(/([\d]️⃣)/g, '<span class="option-emoji">$1</span>')

  return formattedText
}
