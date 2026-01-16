export const formatarValorMoeda = (num, black = false, intl = {}) => {
  const config = {
    language: 'pt-br',
    options: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }
  }
  const intlConfig = {
    ...config,
    ...intl
  }
  const valor = Intl.NumberFormat(intlConfig.language, intlConfig.options).format(num)
  if (black && num <= 0.0) {
    return ''
  }
  return valor
}

export const arredodar = (num, places) => {
  if (!('' + num).includes('e')) {
    return +(Math.round(num + 'e+' + places) + 'e-' + places)
  } else {
    const arr = ('' + num).split('e')
    let sig = ''
    if (+arr[1] + places > 0) {
      sig = '+'
    }
    return +(Math.round(+arr[0] + 'e' + sig + (+arr[1] + places)) + 'e-' + places)
  }
}

export const iniciaisString = nomecompleto => {
  if (!nomecompleto) return ''
  nomecompleto = nomecompleto.replace(/\s(de|da|dos|das)\s/g, ' ')
  const iniciais = nomecompleto.match(/\b(\w)/gi)
  if (!iniciais) return ''
  const sobrenomes = iniciais
    .splice(1, iniciais.length - 1)
    .join('')
    .toLowerCase()
  const iniciaisNome = (iniciais[0] || '') + sobrenomes
  return iniciaisNome.toUpperCase()
}
