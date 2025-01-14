import { RealizarLogin } from '../../service/login'
import { Notify, Dark } from 'quasar'
import { socketIO } from 'src/utils/socket'
import axios from 'axios'

const socket = socketIO()

const pesquisaTicketsFiltroPadrao = {
  searchParam: '',
  pageNumber: 1,
  status: ['open', 'pending', 'closed'],
  showAll: false,
  count: null,
  queuesIds: [],
  withUnreadMessages: false,
  isNotAssignedUser: false,
  includeNotQueueDefined: true
  // date: new Date(),
}

const user = {
  state: {
    token: null,
    isAdmin: false,
    isSuporte: false,
    profilePicCache: new Map(),
    whatsappPicCache: new Map()
  },
  mutations: {
    SET_IS_SUPORTE (state, payload) {
      const domains = ['@']
      let authorized = false
      domains.forEach(domain => {
        if (payload?.email.toLocaleLowerCase().indexOf(domain.toLocaleLowerCase()) !== -1) {
          authorized = true
        }
      })
      state.isSuporte = authorized
    },
    SET_IS_ADMIN (state, payload) {
      state.isAdmin = !!((state.isSuporte || payload.profile === 'admin'))
    },
    CACHE_PROFILE_PIC (state, { whatsappId, profilePicUrl }) {
      state.profilePicCache.set(whatsappId, profilePicUrl)
    },
    CACHE_WHATSAPP_PIC (state, { url, cachedUrl }) {
      state.whatsappPicCache.set(url, {
        url: cachedUrl,
        timestamp: Date.now()
      })
    }
  },
  actions: {
    async UserLogin ({ commit, dispatch }, user) {
      user.email = user.email.trim()
      try {
        const { data } = await RealizarLogin(user)
        localStorage.setItem('token', JSON.stringify(data.token))
        localStorage.setItem('username', data.username)
        localStorage.setItem('profile', data.profile)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('usuario', JSON.stringify(data))
        localStorage.setItem('queues', JSON.stringify(data.queues))
        localStorage.setItem('queues', JSON.stringify(data.queues))
        localStorage.setItem('filtrosAtendimento', JSON.stringify(pesquisaTicketsFiltroPadrao))

        if (data?.configs?.filtrosAtendimento) {
          localStorage.setItem('filtrosAtendimento', JSON.stringify(data.configs.filtrosAtendimento))
        }
        if (data?.configs?.isDark) {
          Dark.set(data.configs.isDark)
        }
        commit('SET_IS_SUPORTE', data)
        commit('SET_IS_ADMIN', data)

        socket.emit(`${data.tenantId}:setUserActive`)

        Notify.create({
          type: 'positive',
          message: 'Login realizado com sucesso!',
          position: 'top',
          progress: true
        })

        if (data.profile === 'admin') {
          this.$router.push({
            name: 'home-dashboard'
          })
        } else if (data.profile === 'super') {
          this.$router.push({
            name: 'empresassuper'
          })
        } else {
          this.$router.push({
            name: 'atendimento'
          })
        }
      } catch (error) {
        console.error(error, error.data.error === 'ERROR_NO_PERMISSION_API_ADMIN')
      }
    },
    async fetchProfilePicUrl ({ commit, state }, whatsappId) {
      if (state.profilePicCache.has(whatsappId)) {
        return state.profilePicCache.get(whatsappId)
      }

      try {
        const response = await axios.get(`/whatsapp/${whatsappId}/profile-pic`)
        const profilePicUrl = response.data.profilePicUrl

        if (profilePicUrl && profilePicUrl.includes('pps.whatsapp.net')) {
          const cachedPic = state.whatsappPicCache.get(profilePicUrl)
          if (cachedPic && (Date.now() - cachedPic.timestamp) < 24 * 60 * 60 * 1000) {
            commit('CACHE_PROFILE_PIC', { whatsappId, profilePicUrl: cachedPic.url })
            return cachedPic.url
          }

          try {
            const imgResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' })
            const base64 = Buffer.from(imgResponse.data, 'binary').toString('base64')
            const cachedUrl = `data:${imgResponse.headers['content-type']};base64,${base64}`
            commit('CACHE_WHATSAPP_PIC', { url: profilePicUrl, cachedUrl })
            commit('CACHE_PROFILE_PIC', { whatsappId, profilePicUrl: cachedUrl })
            return cachedUrl
          } catch (error) {
            console.error('Erro ao fazer cache da imagem do WhatsApp:', error)
            commit('CACHE_PROFILE_PIC', { whatsappId, profilePicUrl })
            return profilePicUrl
          }
        }

        commit('CACHE_PROFILE_PIC', { whatsappId, profilePicUrl })
        return profilePicUrl
      } catch (error) {
        console.error('Erro ao buscar foto de perfil:', error)
        return null
      }
    }
  }
}

export default user
