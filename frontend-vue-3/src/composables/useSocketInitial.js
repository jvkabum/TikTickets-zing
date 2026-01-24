import { onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/useAuthStore'
import { useTicketStore } from 'src/stores/useTicketStore'
import { useWhatsappStore } from 'src/stores/useWhatsappStore'
import { useUsuarioStore } from 'src/stores/useUsuarioStore'
import { ConsultarTickets } from 'src/service/tickets'
import bus from 'src/utils/eventBus'
import { socketIO } from 'src/utils/socket'

const socket = socketIO()

export function useSocketInitial () {
  const $q = useQuasar()
  const router = useRouter()
  const authStore = useAuthStore()
  const ticketStore = useTicketStore()
  const whatsappStore = useWhatsappStore()

  // Usuário e ID serão recuperados dentro do socketInitial
  // para garantir que pegamos os dados atualizados pós-login

  const handleNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new self.Notification(title, options)
    }
  }

  const socketInitial = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const userId = +localStorage.getItem('userId')

    if (!usuario || !usuario.tenantId) {
      console.warn('useSocketInitial: Usuário não encontrado no localStorage. Abortando socketInitial.')
      return
    }

    // Evitar duplicidade de listeners no singleton
    socket.off('connect')
    socket.off(`${usuario.tenantId}:whatsappSession`)
    socket.off(`${usuario.tenantId}:whatsapp`)
    socket.off(`${usuario.tenantId}:ticketList`)
    socket.off(`${usuario.tenantId}:change_battery`)
    socket.off(`${usuario.tenantId}:chat:updateOnlineBubbles`)

    const joinRooms = () => {
      console.log('useSocketInitial: Joining notification room for tenant', usuario.tenantId)
      socket.emit(`${usuario.tenantId}:joinNotification`)
    }

    socket.on('connect', () => {
      console.log('useSocketInitial: Socket connected/reconnected', socket.id)
      joinRooms()
    })

    // Entrar na sala imediatamente se já estiver conectado
    if (socket.connected) {
      joinRooms()
    }

    socket.on(`tokenInvalid:${socket.id}`, () => {
      socket.disconnect()
      authStore.logout()
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 1000)
    })

    socket.on(`${usuario.tenantId}:whatsapp`, data => {
      if (data.action === 'update') {
        whatsappStore.updateWhatsapp(data.whatsapp)
      }
      if (data.action === 'delete') {
        whatsappStore.removeWhatsapp(data.whatsappId)
      }
    })

    const handleWhatsappSession = data => {
      console.log(`useSocketInitial: Evento whatsappSession recebido (${data.action})`, data)

      if (data.action === 'update') {
        whatsappStore.updateSession(data.session)
        bus.emit('UPDATE_SESSION', data.session)
      }

      if (data.action === 'readySession') {
        whatsappStore.updateSession(data.session)
        bus.emit('UPDATE_SESSION', data.session) // Garante que o modal feche
        $q.notify({
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
    }



    socket.on(`${usuario.tenantId}:whatsappSession`, handleWhatsappSession)
    socket.on('whatsappSession', handleWhatsappSession) // Fallback global logado

    socket.on(`${usuario.tenantId}:change_battery`, data => {
      $q.notify({
        message: `Bateria do celular do whatsapp ${data.batteryInfo.sessionName} está com bateria em ${data.batteryInfo.battery}%. Necessário iniciar carregamento.`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    })

    socket.on(`${usuario.tenantId}:ticketList`, async data => {
      // Notificações de Chat Criado
      if (data.type === 'chat:create') {
        if (data.payload.ticket.userId !== userId) return
        if (data.payload.fromMe) return

        handleNotification('Contato: ' + data.payload.ticket.contact.name, {
          body: 'Mensagem: ' + data.payload.body,
          tag: 'simple-push-demo-notification',
          image: data.payload.ticket.contact.profilePicUrl,
          icon: data.payload.ticket.contact.profilePicUrl
        })

        try {
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
          const { data: respData } = await ConsultarTickets(params)
          ticketStore.updateNotifications(respData)
        } catch (err) {
          console.error(err)
        }
      }

      // Notificações de Novo Atendimento Pendente
      if (data.type === 'notification:new') {
        try {
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
          const { data: respData } = await ConsultarTickets(params)
          ticketStore.updateNotificationsP(respData)

          const hasTicket = respData.tickets.some(t => t.id === data.payload.id)
          if (hasTicket) {
            handleNotification('Novo cliente pendente', {
              body: 'Cliente: ' + data.payload.contact.name,
              tag: 'simple-push-demo-notification'
            })
          }
        } catch (err) {
          console.error(err)
        }
      }
    })

    socket.on(`${usuario.tenantId}:chat:updateOnlineBubbles`, data => {
      const usuarioStore = useUsuarioStore()
      usuarioStore.setUsersApp(data)
    })
  }

  onMounted(() => {
    socketInitial()
  })

  onUnmounted(() => {
    // Idealmente não desconectamos o socket global do layout,
    // a menos que seja realmente necessário.
    // socket.disconnect()
  })

  return {
    socketInitial
  }
}
