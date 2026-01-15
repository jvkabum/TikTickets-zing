const usuario = JSON.parse(localStorage.getItem('usuario'))
import Router from 'src/router/index'
import { ConsultarTickets } from 'src/service/tickets'
import bus from 'src/utils/eventBus'
import { socketIO } from '../utils/socket'

const socket = socketIO()
// ... (código intermediário mantido igual)
const userId = +localStorage.getItem('userId')

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  setTimeout(() => {
    Router.push({
      name: 'login'
    })
  }, 1000)
})

export default {
  methods: {
    socketInitial() {
      socket.emit(`${usuario.tenantId}:joinNotification`)

      socket.io.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        if (data.type === 'chat:create') {
          if (data.payload.ticket.userId !== userId) return
          if (data.payload.fromMe) return
          new self.Notification('Contato: ' + data.payload.ticket.contact.name, {
            body: 'Mensagem: ' + data.payload.body,
            tag: 'simple-push-demo-notification',
            image: data.payload.ticket.contact.profilePicUrl,
            icon: data.payload.ticket.contact.profilePicUrl
          })

          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: true,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const { data } = await ConsultarTickets(params)
            this.countTickets = data.count
            this.$store.commit('UPDATE_NOTIFICATIONS', data)
          } catch (err) {
            this.$notificarErro('Algum problema', err)
            console.error(err)
          }
        }
      })

      socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'delete') {
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
          bus.emit('UPDATE_SESSION', data.session)
        }

        if (data.action === 'readySession') {
          this.$q.notify({
            position: 'top',
            icon: 'mdi-wifi-arrow-up-down',
            message: `A conexão com o WhatsApp está pronta e o mesmo está habilitado para enviar e receber mensagens. Conexão: ${data.session.name}. Número: ${data.session.number}.`,
            type: 'positive',
            color: 'primary',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{ icon: 'close', round: true, color: 'white' }],
            classes: 'text-body2 text-weight-medium'
          })
        }
      })

      socket.on(`${usuario.tenantId}:change_battery`, data => {
        this.$q.notify({
          message: `Bateria do celular do whatsapp ${data.batteryInfo.sessionName} está com bateria em ${data.batteryInfo.battery}%. Necessário iniciar carregamento.`,
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{ icon: 'close', round: true, color: 'white' }]
        })
      })

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        if (data.type === 'notification:new') {
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['pending'],
            showAll: false,
            count: null,
            queuesIds: [],
            withUnreadMessages: false,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const data_noti = await ConsultarTickets(params)
            this.$store.commit('UPDATE_NOTIFICATIONS_P', data_noti.data)

            let pass_noti = false
            data_noti.data.tickets.forEach((element) => { pass_noti = (element.id == data.payload.id ? true : pass_noti) })

            if (pass_noti) {
              new self.Notification('Novo cliente pendente', {
                body: 'Cliente: ' + data.payload.contact.name,
                tag: 'simple-push-demo-notification'
              })
            }
          } catch (err) {
            this.$notificarErro('Algum problema', err)
            console.error(err)
          }
        }
      })
    }
  },
  mounted() {
    this.socketInitial()
  },
  unmounted() {
    socket && socket.disconnect()
  }
}
