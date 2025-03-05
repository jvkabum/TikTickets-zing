export function formatarMensagemWhatsapp (body) {
  if (!body) return ''

  // Substitui quebras de linha por <br>
  let formattedText = body.replace(/\n/g, '<br>')

  // Formata texto em negrito
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')

  // Formata texto em itálico
  formattedText = formattedText.replace(/_([^_]+)_/g, '<em>$1</em>')

  // Formata texto riscado
  formattedText = formattedText.replace(/~([^~]+)~/g, '<del>$1</del>')

  // Formata código
  formattedText = formattedText.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>')

  return formattedText
}
