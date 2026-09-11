/**
 * Funções utilitárias de manipulação de Canvas HTML5 para o Editor de Mídia
 * Baseado na implementação comprovada do Gesttik
 */

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = err => reject(err)

    if (typeof src === 'string') {
      img.src = src
    } else {
      const url = URL.createObjectURL(src)
      img.src = url
    }
  })
}

export function applyCanvasFilters(ctx, adjustments) {
  if (!adjustments) return
  const b = 100 + (adjustments.brightness || 0)
  const c = 100 + (adjustments.contrast || 0)
  const s = 100 + (adjustments.saturation || 0)

  let extra = ''
  if (adjustments.preset === 'comprovante') {
    // Comprovante: grayscale + alto contraste para destacar números e letras
    extra = ' grayscale(100%) contrast(160%) brightness(105%)'
  } else if (adjustments.preset === 'bw') {
    extra = ' grayscale(100%)'
  } else if (adjustments.preset === 'vivid') {
    extra = ' saturate(160%) contrast(110%)'
  }

  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)${extra}`
}

export function drawArrow(ctx, fromX, fromY, toX, toY, color, width) {
  const headLength = Math.max(16, width * 3.5)
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Linha principal da seta
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  // Ponta da seta
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function drawPen(ctx, points, color, width) {
  if (!points || points.length < 2) return

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  ctx.stroke()
  ctx.restore()
}

export function applyBlurRect(ctx, rect, type = 'redact') {
  if (!rect || rect.width <= 0 || rect.height <= 0) return

  ctx.save()

  if (type === 'redact') {
    // Tarja preta sólida de segurança total
    ctx.fillStyle = '#09090b'
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)

    // Detalhe sutil de borda para elegância
    ctx.strokeStyle = '#27272a'
    ctx.lineWidth = 1
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  } else {
    // Efeito de pixelização / blur com canvas temporário
    try {
      const imgData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height)
      const pixelSize = 10
      const w = imgData.width
      const h = imgData.height

      for (let y = 0; y < h; y += pixelSize) {
        for (let x = 0; x < w; x += pixelSize) {
          const redIdx = (y * w + x) * 4
          const r = imgData.data[redIdx]
          const g = imgData.data[redIdx + 1]
          const b = imgData.data[redIdx + 2]

          for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
            for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4
              imgData.data[idx] = r
              imgData.data[idx + 1] = g
              imgData.data[idx + 2] = b
            }
          }
        }
      }
      ctx.putImageData(imgData, rect.x, rect.y)
    } catch (e) {
      // Fallback para tarja escura se CORS bloquear leitura de pixels
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }
  }

  ctx.restore()
}

export function canvasToFile(canvas, filename = 'imagem-editada.jpg', mimeType = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Falha ao converter canvas para blob'))
          return
        }
        const file = new File([blob], filename, { type: mimeType, lastModified: Date.now() })
        resolve(file)
      },
      mimeType,
      quality
    )
  })
}
