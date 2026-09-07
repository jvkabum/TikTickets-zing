import { Dark, uid } from 'quasar'

import { boot } from 'quasar/wrappers'
import DatePick from '../components/base/cDatePick.vue'
import cDateTimePick from '../components/base/cDateTimePick.vue'
import cInput from '../components/base/cInput.vue'
import { notificarErro, notificarSucesso } from '../utils/helpersNotifications'

import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { UpdateConfiguracoesUsuarios } from '../service/user'
import { arredodar, formatarValorMoeda, iniciaisString } from '../utils/formatValue'

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
  const userId = usuario?.id || localStorage.getItem('userId')

  if (!userId || userId === 'undefined') {
    console.warn('ID do usuário não encontrado para sincronizar configurações')
    localStorage.setItem('usuario', JSON.stringify({ ...usuario, configs: { isDark: Dark.isActive } }))
    return
  }

  const filtrosAtendimento = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const data = {
    filtrosAtendimento,
    isDark: Dark.isActive
  }
  UpdateConfiguracoesUsuarios(userId, data)
    .then(r => console.log('Configurações do usuário atualizadas'))
    .catch(e => console.error('Erro ao atualizar configurações:', e))

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
