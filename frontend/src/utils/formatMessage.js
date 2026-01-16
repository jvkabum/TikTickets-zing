export function formatarMensagemWhatsapp (body) {
  if (!body) return ''

  function is_alphanumeric (c) {
    const x = c.charCodeAt()
    return !!((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57))
  }

  function applyStyle (text, wildcard, opTag, clTag) {
    const indices = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] === wildcard) {
        if (indices.length % 2) {
          if (text[i - 1] !== ' ') {
            if (typeof text[i + 1] === 'undefined' || !is_alphanumeric(text[i + 1])) {
              indices.push(i)
            }
          }
        } else {
          if (typeof text[i + 1] !== 'undefined' && text[i + 1] !== ' ') {
            if (typeof text[i - 1] === 'undefined' || !is_alphanumeric(text[i - 1])) {
              indices.push(i)
            }
          }
        }
      } else {
        if (text[i].charCodeAt() === 10 && indices.length % 2) {
          indices.pop()
        }
      }
    }

    if (indices.length % 2) {
      indices.pop()
    }

    let e = 0
    let result = text
    indices.forEach(function (v, i) {
      const t = i % 2 ? clTag : opTag
      v += e
      result = result.substr(0, v) + t + result.substr(v + 1)
      e += t.length - 1
    })
    return result
  }

  let formatted = body
  formatted = applyStyle(formatted, '_', '<i>', '</i>')
  formatted = applyStyle(formatted, '*', '<b>', '</b>')
  formatted = applyStyle(formatted, '~', '<s>', '</s>')
  formatted = formatted.replace(/\n/gi, '<br>')

  return formatted
}
