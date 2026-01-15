import { Dark, uid } from 'quasar'
import { boot } from 'quasar/wrappers'
import DatePick from '../components/cDatePick.vue'
import cDateTimePick from '../components/cDateTimePick.vue'
import cInput from '../components/cInput.vue'
import { notificarErro, notificarSucesso } from '../utils/helpersNotifications'

import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { UpdateConfiguracoesUsuarios } from '../service/user'

const formatarValorMoeda = (num, black = false, intl = {}) => {
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

const arredodar = (num, places) => {
  if (!('' + num).includes('e')) {
    return +(Math.round(num + 'e+' + places) + 'e-' + places)
  } else {
    const arr = ('' + num).split('e')
    let sig = ''
    if (+arr[1] + places > 0) {
      sig = '+'
    }
    return +(
      Math.round(+arr[0] + 'e' + sig + (+arr[1] + places)) +
      'e-' +
      places
    )
  }
}

const iniciaisString = nomecompleto => {
  nomecompleto = nomecompleto.replace(/\s(de|da|dos|das)\s/g, ' ')
  const iniciais = nomecompleto.match(/\b(\w)/gi)
  const sobrenomes = iniciais
    .splice(1, iniciais.length - 1)
    .join('')
    .toLowerCase()
  const iniciaisNome = iniciais + sobrenomes
  return iniciaisNome.toUpperCase()
}

const formatarData = (data, formato = 'dd/MM/yyyy') => {
  return format(parseISO(data), formato, { locale: pt })
}

const setConfigsUsuario = ({ isDark }) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  }
  Dark.set(isDark)
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const filtrosAtendimento = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const data = {
    filtrosAtendimento,
    isDark: Dark.isActive
  }
  UpdateConfiguracoesUsuarios(usuario.userId, data)
    .then(r => console.log('Configurações do usuário atualizadas'))
    .catch(e => console.error)

  localStorage.setItem('usuario', JSON.stringify({ ...usuario, configs: data }))
}

export default boot(({ app }) => {
  app.component('cInput', cInput)
  app.component('DatePick', DatePick)
  app.component('cDateTimePick', cDateTimePick)

  app.config.globalProperties.$formatarValorMoeda = formatarValorMoeda
  app.config.globalProperties.$round = arredodar
  app.config.globalProperties.$formatarData = formatarData
  app.config.globalProperties.$iniciaisString = iniciaisString
  app.config.globalProperties.$notificarErro = notificarErro
  app.config.globalProperties.$notificarSucesso = notificarSucesso
  app.config.globalProperties.$setConfigsUsuario = setConfigsUsuario
  app.config.globalProperties.$uuid = uid
})
